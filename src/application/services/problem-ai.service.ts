import type { Env } from "../../config/env.js"
import type { GenerateProblemDraftDto, GeneratedProblemDraftDto } from "../dto/problem-ai.dto.js"
import { createProblemSchema } from "../dto/problem.dto.js"
import { GeminiClient } from "../../infrastructure/ai/gemini.client.js"
import { PROBLEM_TAG_SLUGS } from "../../shared/problems/tags.js"
import { BadGatewayError, BadRequestError, ServiceUnavailableError } from "../../shared/errors/app-error.js"

function stripJsonFence(raw: string): string {
  const trimmed = raw.trim()
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  return fenceMatch ? fenceMatch[1].trim() : trimmed
}

function buildSystemInstruction(inputMode: "lines" | "json"): string {
  const inputHelp =
    inputMode === "lines"
      ? `Test input format is "lines": each test case "input" is a string with one argument per line, passed positionally to solve(...). Example for solve(nums, target): input "[2,7,11,15]\\n9". Values use JSON-like literals (numbers, arrays, objects, quoted strings).`
      : `Test input format is "json": each test case "input" is a single JSON value string passed as solve(input). Example: "{\\"nums\\":[2,7,11,15],\\"target\\":9}".`

  return `You are an expert competitive programming problem author for HackIT.

Players implement:
- Python: def solve(...) or def solve(input) depending on input mode
- JavaScript: function solve(...) or function solve(input)

${inputHelp}

Each test case in the JSON you output must include: input (string), expectedOutput (string), isSample (boolean), order (integer starting at 0 per group).

Requirements:
- Output ONLY valid JSON matching the schema below. No markdown fences, no commentary.
- title: concise, max 200 chars
- statement: Markdown with problem description, input/output format, constraints, and at least one example
- difficulty: easy | medium | hard
- timeLimitMs: integer 100-30000 (default 2000)
- memoryLimitMb: integer 16-1024 (default 256)
- starterPython and starterJs: function signatures matching the problem and input mode; use pass / empty body
- tags: array of 1-5 unique slugs from ONLY this list: ${JSON.stringify(PROBLEM_TAG_SLUGS)}
- testCases: at least 4 total — at least 2 with isSample true and at least 2 with isSample false; hidden tests must differ from samples but stay valid

JSON schema (types):
{
  "title": string,
  "statement": string,
  "difficulty": "easy"|"medium"|"hard",
  "timeLimitMs": number,
  "memoryLimitMb": number,
  "starterPython": string|null,
  "starterJs": string|null,
  "tags": string[],
  "testCases": [{ "input": string, "expectedOutput": string, "isSample": boolean, "order": number }]
}`
}

export class ProblemAiService {
  private readonly gemini: GeminiClient | null

  constructor(private readonly env: Env) {
    this.gemini =
      env.GEMINI_API_KEY.trim().length > 0
        ? new GeminiClient(env.GEMINI_API_KEY, env.GEMINI_MODEL)
        : null
  }

  async generateDraft(input: GenerateProblemDraftDto): Promise<GeneratedProblemDraftDto> {
    if (!this.gemini) {
      throw new ServiceUnavailableError(
        "AI problem generation is not configured. Set GEMINI_API_KEY on the server.",
      )
    }

    const difficultyHint = input.difficulty ?? "pick an appropriate difficulty"
    const userPrompt = `Topic / request: ${input.prompt}

Preferred difficulty: ${difficultyHint}
Test input mode: ${input.inputMode}

Generate a complete original problem draft.`

    if (this.env.NODE_ENV === "development") {
      console.info("[problem-ai] generate draft", { promptLength: input.prompt.length, inputMode: input.inputMode })
    }

    let raw: string
    try {
      raw = await this.gemini.generateText(buildSystemInstruction(input.inputMode), userPrompt)
    } catch (err) {
      throw err
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(stripJsonFence(raw))
    } catch {
      throw new BadGatewayError("AI returned invalid JSON. Try again with a clearer topic.")
    }

    const validated = createProblemSchema.safeParse(parsed)
    if (!validated.success) {
      const issue = validated.error.issues[0]?.message ?? "Invalid problem draft"
      throw new BadRequestError(`AI draft failed validation: ${issue}`)
    }

    const sampleCount = validated.data.testCases.filter((t) => t.isSample).length
    const hiddenCount = validated.data.testCases.filter((t) => !t.isSample).length
    if (sampleCount < 2 || hiddenCount < 2) {
      throw new BadRequestError("AI draft must include at least 2 sample and 2 hidden test cases")
    }

    return validated.data
  }
}
