import { spawn } from "node:child_process"
import { mkdtemp, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pythonRuntime } from "../../infrastructure/judge/python-runtime.js"
import { BadRequestError } from "../../shared/errors/app-error.js"
import { parseTestValue, toSolveArgs } from "../../shared/judge/parse-test-value.js"

export type JudgeLanguage = "javascript" | "python"

export type JudgeTestCase = {
  input: string
  expectedOutput: string
}

export type JudgeCaseResult = {
  index: number
  passed: boolean
  expected?: string
  actual?: string
  error?: string
}

export type JudgeVerdict = {
  status: "accepted" | "wrong_answer" | "runtime_error" | "timeout" | "compile_error" | "unsupported"
  cases: JudgeCaseResult[]
  message?: string
}

const languageMap: Record<JudgeLanguage, string> = {
  javascript: "javascript",
  python: "python",
}

export function normalizeJudgeLanguage(language: string): JudgeLanguage {
  const normalized = language.toLowerCase()
  if (normalized === "js" || normalized === "javascript") return "javascript"
  if (normalized === "py" || normalized === "python") return "python"
  throw new BadRequestError(`Unsupported language: ${language}`)
}

function toRunnerCases(testCases: JudgeTestCase[]) {
  return testCases.map((test) => ({
    args: toSolveArgs(test.input),
    expected: parseTestValue(test.expectedOutput),
  }))
}

function buildJavaScriptRunner(sourceCode: string, exportName: string, testCases: JudgeTestCase[]): string {
  const casesJson = JSON.stringify(toRunnerCases(testCases))

  return `${sourceCode}

const __tests = ${casesJson};
const __exportName = ${JSON.stringify(exportName)};

function __formatTestValue(value) {
  if (typeof value === "string") return value.trim();
  return JSON.stringify(value);
}

function __valuesEqual(actual, expected) {
  const actualIsObject = typeof actual === "object" && actual !== null;
  const expectedIsObject = typeof expected === "object" && expected !== null;
  if (actualIsObject || expectedIsObject) {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
  return String(actual).trim() === String(expected).trim();
}

function __resolveSolve() {
  if (typeof globalThis[__exportName] === "function") return globalThis[__exportName];
  if (typeof ${exportName} === "function") return ${exportName};
  throw new Error("Define ${exportName}(...) in your solution.");
}

const __solve = __resolveSolve();
const __results = [];

for (let i = 0; i < __tests.length; i++) {
  const test = __tests[i];
  try {
    const actual = __solve(...test.args);
    const passed = __valuesEqual(actual, test.expected);
    __results.push({
      index: i + 1,
      passed,
      expected: __formatTestValue(test.expected),
      actual: __formatTestValue(actual),
    });
  } catch (error) {
    __results.push({
      index: i + 1,
      passed: false,
      expected: __formatTestValue(test.expected),
      error: error instanceof Error ? error.message : String(error),
    });
    break;
  }
}

console.log(JSON.stringify({ status: __results.every((item) => item.passed) ? "accepted" : "wrong_answer", cases: __results }));
`
}

function buildPythonRunner(sourceCode: string, exportName: string, testCases: JudgeTestCase[]): string {
  const casesJson = JSON.stringify(toRunnerCases(testCases))

  return `${sourceCode}

import json

__tests = json.loads(${JSON.stringify(casesJson)})
__export_name = ${JSON.stringify(exportName)}

def __format_test_value(value):
    if isinstance(value, str):
        return value.strip()
    return json.dumps(value, separators=(",", ":"))

def __is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)

def __values_equal(actual, expected):
    if isinstance(actual, (dict, list, tuple)) or isinstance(expected, (dict, list)):
        return json.dumps(actual, separators=(",", ":")) == json.dumps(expected, separators=(",", ":"))
    if __is_number(actual) and __is_number(expected):
        return actual == expected
    return str(actual).strip() == str(expected).strip()

def __resolve_solve():
    fn = globals().get(__export_name)
    if callable(fn):
        return fn
    raise RuntimeError(f"Define {__export_name}(...) in your solution.")

__solve = __resolve_solve()
__results = []

for i, test in enumerate(__tests, start=1):
    try:
        actual = __solve(*test["args"])
        expected = test["expected"]
        passed = __values_equal(actual, expected)
        __results.append({
            "index": i,
            "passed": passed,
            "expected": __format_test_value(expected),
            "actual": __format_test_value(actual),
        })
    except Exception as error:
        __results.append({
            "index": i,
            "passed": False,
            "expected": __format_test_value(test["expected"]),
            "error": str(error),
        })
        break

status = "accepted" if all(item["passed"] for item in __results) else "wrong_answer"
print(json.dumps({"status": status, "cases": __results}))
`
}

function inferExportName(sourceCode: string, language: JudgeLanguage): string {
  if (language === "javascript") {
    const match =
      sourceCode.match(/export\s+(?:async\s+)?function\s+(\w+)/) ??
      sourceCode.match(/function\s+(\w+)\s*\(/)
    if (match?.[1]) return match[1]
  }
  if (language === "python") {
    const match = sourceCode.match(/^def\s+(\w+)\s*\(/m)
    if (match?.[1]) return match[1]
  }
  return "solve"
}

async function runProcess(
  command: string,
  args: string[],
  timeoutMs: number,
): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""
    let timedOut = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill("SIGKILL")
    }, timeoutMs)

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
    })
    child.on("close", (exitCode) => {
      clearTimeout(timer)
      resolve({ stdout, stderr, exitCode, timedOut })
    })
    child.on("error", () => {
      clearTimeout(timer)
      resolve({ stdout, stderr, exitCode: 1, timedOut })
    })
  })
}

function parseJudgeOutput(stdout: string, stderr: string): JudgeVerdict {
  const line = stdout
    .trim()
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1)

  if (!line) {
    return {
      status: "runtime_error",
      cases: [],
      message: stderr || "No output from judge",
    }
  }

  try {
    const parsed = JSON.parse(line) as { status: JudgeVerdict["status"]; cases: JudgeCaseResult[] }
    return {
      status: parsed.status,
      cases: parsed.cases ?? [],
      message: stderr || undefined,
    }
  } catch {
    return {
      status: "runtime_error",
      cases: [],
      message: stderr || stdout || "Invalid judge output",
    }
  }
}

export class CodeJudgeService {
  async judge(
    languageInput: string,
    sourceCode: string,
    testCases: JudgeTestCase[],
    timeLimitMs: number,
  ): Promise<JudgeVerdict> {
    const language = normalizeJudgeLanguage(languageInput)

    if (testCases.length === 0) {
      throw new BadRequestError("No test cases to run")
    }

    if (language === "python") {
      return this.judgePython(sourceCode, testCases, timeLimitMs)
    }

    return this.judgeJavaScript(sourceCode, testCases, timeLimitMs)
  }

  private async judgeJavaScript(
    sourceCode: string,
    testCases: JudgeTestCase[],
    timeLimitMs: number,
  ): Promise<JudgeVerdict> {
    const exportName = inferExportName(sourceCode, "javascript")
    const runnerSource = buildJavaScriptRunner(sourceCode, exportName, testCases)
    const dir = await mkdtemp(join(tmpdir(), "hackit-judge-js-"))
    const filePath = join(dir, "runner.mjs")

    try {
      await writeFile(filePath, runnerSource, "utf8")
      const result = await runProcess("node", [filePath], timeLimitMs + 500)

      if (result.timedOut) {
        return { status: "timeout", cases: [], message: "Execution timed out" }
      }

      if (result.exitCode !== 0 && !result.stdout.trim()) {
        return {
          status: "runtime_error",
          cases: [],
          message: result.stderr || "Node process failed",
        }
      }

      return parseJudgeOutput(result.stdout, result.stderr)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  }

  private async judgePython(
    sourceCode: string,
    testCases: JudgeTestCase[],
    timeLimitMs: number,
  ): Promise<JudgeVerdict> {
    const exportName = inferExportName(sourceCode, "python")
    const runnerSource = buildPythonRunner(sourceCode, exportName, testCases)
    const result = await pythonRuntime.run(runnerSource, timeLimitMs + 500)

    if (result.timedOut) {
      return { status: "timeout", cases: [], message: "Execution timed out" }
    }

    if (result.error && !result.stdout.trim()) {
      return {
        status: "runtime_error",
        cases: [],
        message: cleanPythonTraceback(result.error),
      }
    }

    return parseJudgeOutput(result.stdout, result.stderr)
  }
}

function cleanPythonTraceback(message: string): string {
  const lines = message.trimEnd().split("\n")
  const userFrame = lines.findIndex((line) => line.includes('File "<exec>"'))
  if (userFrame === -1) return message.trim()
  return ["Traceback (most recent call last):", ...lines.slice(userFrame)].join("\n")
}

export { languageMap }

