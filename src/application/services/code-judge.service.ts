import { spawn } from "node:child_process"
import { mkdtemp, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { BadRequestError } from "../../shared/errors/app-error.js"

export type JudgeLanguage = "javascript" | "python" | "cpp"

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
  cpp: "cpp",
}

export function normalizeJudgeLanguage(language: string): JudgeLanguage {
  const normalized = language.toLowerCase()
  if (normalized === "js" || normalized === "javascript") return "javascript"
  if (normalized === "py" || normalized === "python") return "python"
  if (normalized === "c++" || normalized === "cpp") return "cpp"
  throw new BadRequestError(`Unsupported language: ${language}`)
}

function buildJavaScriptRunner(sourceCode: string, exportName: string, testCases: JudgeTestCase[]): string {
  const casesJson = JSON.stringify(testCases)

  return `${sourceCode}

const __tests = ${casesJson};
const __exportName = ${JSON.stringify(exportName)};

function __parseTestValue(raw) {
  const t = String(raw).trim();
  if (!t) return raw;
  try { return JSON.parse(t); } catch { return raw; }
}

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
  throw new Error("Define ${exportName}(input) in your solution.");
}

const __solve = __resolveSolve();
const __results = [];

for (let i = 0; i < __tests.length; i++) {
  const test = __tests[i];
  try {
    const parsedInput = __parseTestValue(test.input);
    const actual = __solve(parsedInput);
    const expected = __parseTestValue(test.expectedOutput);
    const passed = __valuesEqual(actual, expected);
    __results.push({
      index: i + 1,
      passed,
      expected: __formatTestValue(expected),
      actual: __formatTestValue(actual),
    });
  } catch (error) {
    __results.push({
      index: i + 1,
      passed: false,
      expected: __formatTestValue(__parseTestValue(test.expectedOutput)),
      error: error instanceof Error ? error.message : String(error),
    });
    break;
  }
}

console.log(JSON.stringify({ status: __results.every((item) => item.passed) ? "accepted" : "wrong_answer", cases: __results }));
`
}

function buildPythonRunner(sourceCode: string, exportName: string, testCases: JudgeTestCase[]): string {
  const casesJson = JSON.stringify(testCases)

  return `${sourceCode}

import json

__tests = ${casesJson}
__export_name = ${JSON.stringify(exportName)}

def __parse_test_value(raw):
    text = str(raw).strip()
    if not text:
        return raw
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return raw

def __format_test_value(value):
    if isinstance(value, str):
        return value.strip()
    return json.dumps(value, separators=(",", ":"))

def __values_equal(actual, expected):
    if isinstance(actual, (dict, list)) or isinstance(expected, (dict, list)):
        return json.dumps(actual, separators=(",", ":")) == json.dumps(expected, separators=(",", ":"))
    return str(actual).strip() == str(expected).strip()

def __resolve_solve():
    fn = globals().get(__export_name)
    if callable(fn):
        return fn
    raise RuntimeError(f"Define {exportName}(input) in your solution.")

__solve = __resolve_solve()
__results = []

for i, test in enumerate(__tests, start=1):
    try:
        parsed_input = __parse_test_value(test["input"])
        actual = __solve(parsed_input)
        expected = __parse_test_value(test["expectedOutput"])
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
            "expected": __format_test_value(__parse_test_value(test["expectedOutput"])),
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
  if (language === "cpp") {
    const match = sourceCode.match(/(?:std::)?string\s+(\w+)\s*\(/)
    if (match?.[1] && match[1] !== "main") return match[1]
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

    if (language === "cpp") {
      return this.judgeCpp(sourceCode, testCases, timeLimitMs)
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
    const dir = await mkdtemp(join(tmpdir(), "hackit-judge-py-"))
    const filePath = join(dir, "runner.py")

    try {
      await writeFile(filePath, runnerSource, "utf8")
      const pythonCmd = process.platform === "win32" ? "python" : "python3"
      const result = await runProcess(pythonCmd, [filePath], timeLimitMs + 500)

      if (result.timedOut) {
        return { status: "timeout", cases: [], message: "Execution timed out" }
      }

      if (result.exitCode !== 0 && !result.stdout.trim()) {
        return {
          status: "runtime_error",
          cases: [],
          message: result.stderr || "Python process failed",
        }
      }

      return parseJudgeOutput(result.stdout, result.stderr)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  }

  private async judgeCpp(
    sourceCode: string,
    testCases: JudgeTestCase[],
    timeLimitMs: number,
  ): Promise<JudgeVerdict> {
    const exportName = inferExportName(sourceCode, "cpp")

    const runnerSource = `${sourceCode}

#include <iostream>
#include <string>
#include <vector>

std::string __trim(const std::string& value) {
  size_t start = 0;
  while (start < value.size() && (value[start] == ' ' || value[start] == '\\t' || value[start] == '\\r' || value[start] == '\\n')) start++;
  size_t end = value.size();
  while (end > start && (value[end - 1] == ' ' || value[end - 1] == '\\t' || value[end - 1] == '\\r' || value[end - 1] == '\\n')) end--;
  return value.substr(start, end - start);
}

int main() {
  std::vector<std::pair<std::string, std::string>> tests = {
${testCases
  .map(
    (test) =>
      `    {"${test.input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}", "${test.expectedOutput.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"},`,
  )
  .join("\n")}
  };

  for (size_t i = 0; i < tests.size(); ++i) {
    try {
      std::string actual = __trim(${exportName}(tests[i].first));
      std::string expected = __trim(tests[i].second);
      if (actual != expected) {
        std::cout << "{\\"status\\":\\"wrong_answer\\",\\"cases\\":[{\\"index\\":" << (i + 1)
                  << ",\\"passed\\":false,\\"expected\\":\\"" << expected << "\\",\\"actual\\":\\"" << actual << "\\"}]}" << std::endl;
        return 0;
      }
    } catch (...) {
      std::cout << "{\\"status\\":\\"runtime_error\\",\\"cases\\":[{\\"index\\":" << (i + 1)
                << ",\\"passed\\":false,\\"error\\":\\"runtime error\\"}]}" << std::endl;
      return 0;
    }
  }

  std::cout << "{\\"status\\":\\"accepted\\",\\"cases\\":[]}" << std::endl;
  return 0;
}
`

    const dir = await mkdtemp(join(tmpdir(), "hackit-judge-cpp-"))
    const sourcePath = join(dir, "main.cpp")
    const binaryPath = join(dir, process.platform === "win32" ? "main.exe" : "main")

    try {
      await writeFile(sourcePath, runnerSource, "utf8")
      const compile = await runProcess("g++", ["-std=c++17", "-O2", sourcePath, "-o", binaryPath], 15000)

      if (compile.exitCode !== 0) {
        return {
          status: "compile_error",
          cases: [],
          message: compile.stderr || "C++ compilation failed",
        }
      }

      const result = await runProcess(binaryPath, [], timeLimitMs + 500)

      if (result.timedOut) {
        return { status: "timeout", cases: [], message: "Execution timed out" }
      }

      if (result.exitCode !== 0 && !result.stdout.trim()) {
        return {
          status: "runtime_error",
          cases: [],
          message: result.stderr || "C++ process failed",
        }
      }

      const parsed = parseJudgeOutput(result.stdout, result.stderr)
      if (parsed.status === "accepted" && parsed.cases.length === 0) {
        return {
          status: "accepted",
          cases: testCases.map((test, index) => ({
            index: index + 1,
            passed: true,
            expected: test.expectedOutput,
          })),
        }
      }
      return parsed
    } catch {
      return {
        status: "unsupported",
        cases: [],
        message: "C++ judge unavailable (g++ not found or failed)",
      }
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  }
}

export { languageMap }
