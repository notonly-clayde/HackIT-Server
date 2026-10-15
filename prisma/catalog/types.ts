export type CatalogDifficulty = "EASY" | "MEDIUM" | "HARD"

export type CatalogInput = Record<string, unknown>

export type CatalogParam = {
  name: string
  type: string
  about: string
}

export type CatalogExample = {
  input: CatalogInput
  why: string
}

export type CatalogProblemDef = {
  seedKey: string
  title: string
  difficulty: CatalogDifficulty
  tags: string[]
  /** Kid-friendly context in markdown; must not change the task. */
  story: string
  /** Ordered: defines solve(a, b, ...) and the one-argument-per-line test order. */
  params: CatalogParam[]
  returns: { type: string; about: string }
  rules?: string[]
  /** Outputs are computed with `solve`, so they always match the tests. */
  examples: CatalogExample[]
  samples: CatalogInput[]
  hiddens: CatalogInput[]
  solve: (input: any) => unknown
  timeLimitMs?: number
  memoryLimitMb?: number
}

export function toArgs(input: CatalogInput, params: CatalogParam[]): unknown[] {
  return params.map((param) => input[param.name])
}

function runSolve(def: CatalogProblemDef, input: CatalogInput): unknown {
  return def.solve(structuredClone(input))
}

export function serializeCases(inputs: CatalogInput[], def: CatalogProblemDef, isSample: boolean) {
  return inputs.map((input, order) => ({
    input: JSON.stringify(toArgs(input, def.params)),
    expectedOutput: JSON.stringify(runSolve(def, input)),
    isSample,
    order,
  }))
}

export function solveSignature(params: CatalogParam[]): string {
  return `solve(${params.map((param) => param.name).join(", ")})`
}

export function buildStarters(params: CatalogParam[]) {
  const names = params.map((param) => param.name).join(", ")
  return {
    python: `def solve(${names}):\n    pass\n`,
    js: `function solve(${names}) {\n}\n`,
  }
}

function buildExample(def: CatalogProblemDef, example: CatalogExample, index: number): string {
  const inputLines = toArgs(example.input, def.params)
    .map((arg) => JSON.stringify(arg))
    .join("\n")
  const output = JSON.stringify(runSolve(def, example.input))

  return [
    `**Example ${index + 1}**`,
    "Input (one argument per line):",
    "```text\n" + inputLines + "\n```",
    `Output: \`${output}\``,
    `Why: ${example.why.trim()}`,
  ].join("\n\n")
}

export function buildStatement(def: CatalogProblemDef): string {
  const sections = [
    `## ${def.title}`,
    def.story.trim(),
    "### What you get",
    def.params.map((param, index) => `${index + 1}. \`${param.name}\` (\`${param.type}\`): ${param.about}`).join("\n"),
    "### What to return",
    `\`${def.returns.type}\`: ${def.returns.about}`,
  ]

  if (def.rules?.length) {
    sections.push("### Good to know", def.rules.map((rule) => `- ${rule}`).join("\n"))
  }

  sections.push(
    "### Examples",
    def.examples.map((example, index) => buildExample(def, example, index)).join("\n\n"),
    "### Your task",
    `Write \`${solveSignature(def.params)}\` and return the answer.`,
  )

  return sections.join("\n\n")
}
