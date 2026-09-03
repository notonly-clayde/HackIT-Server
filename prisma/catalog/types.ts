export type CatalogDifficulty = "EASY" | "MEDIUM" | "HARD"

export type CatalogProblemDef = {
  seedKey: string
  title: string
  statement: string
  difficulty: CatalogDifficulty
  tags: string[]
  samples: unknown[]
  hiddens: unknown[]
  solve: (input: unknown) => unknown
  starterPython?: string
  starterJs?: string
  timeLimitMs?: number
  memoryLimitMb?: number
}

export function serializeCases(
  inputs: unknown[],
  solve: (input: unknown) => unknown,
  isSample: boolean,
) {
  return inputs.map((input, order) => ({
    input: JSON.stringify(input),
    expectedOutput: JSON.stringify(solve(input)),
    isSample,
    order,
  }))
}

export const defaultStarters = {
  python: `def solve(input):\n    # input is already parsed JSON\n    pass\n`,
  js: `function solve(input) {\n  // input is already parsed JSON\n}\n`,
}
