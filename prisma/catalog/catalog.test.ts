import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { toSolveArgs } from "../../src/shared/judge/parse-test-value.js"
import { catalogProblems } from "./problems/index.js"
import { buildStatement, serializeCases, solveSignature, type CatalogInput, type CatalogProblemDef } from "./types.js"

const RESERVED = new Set([
  "and", "as", "assert", "async", "await", "break", "case", "catch", "class", "const", "continue", "debugger",
  "def", "default", "del", "delete", "do", "elif", "else", "enum", "except", "export", "extends", "false",
  "False", "finally", "for", "from", "function", "global", "if", "import", "in", "instanceof", "is", "lambda",
  "let", "new", "nonlocal", "None", "not", "null", "or", "pass", "raise", "return", "static", "super", "switch",
  "this", "throw", "true", "True", "try", "typeof", "var", "void", "while", "with", "yield",
])

function assertInputKeys(def: CatalogProblemDef, input: CatalogInput, label: string) {
  const expected = def.params.map((param) => param.name).sort()
  assert.deepEqual(Object.keys(input).sort(), expected, `${def.seedKey} ${label} keys`)
}

describe("catalog", () => {
  it("has 100+ problems with unique seed keys", () => {
    assert.ok(catalogProblems.length >= 100)
    const keys = catalogProblems.map((def) => def.seedKey)
    assert.equal(new Set(keys).size, keys.length)
  })

  for (const def of catalogProblems) {
    describe(def.seedKey, () => {
      it("has kid-friendly content and well-formed params", () => {
        assert.ok(def.story?.trim(), "story")
        assert.ok(def.returns?.type && def.returns.about?.trim(), "returns")
        assert.ok(def.params?.length > 0, "params")
        for (const param of def.params) {
          assert.match(param.name, /^[A-Za-z_][A-Za-z0-9_]*$/, `param name ${param.name}`)
          assert.ok(!RESERVED.has(param.name), `reserved param name ${param.name}`)
          assert.ok(param.type.trim() && param.about.trim(), `param ${param.name} type/about`)
        }
        assert.equal(new Set(def.params.map((param) => param.name)).size, def.params.length, "unique params")
        assert.ok(def.examples?.length >= 2 && def.examples.length <= 3, "2-3 examples")
        for (const example of def.examples) assert.ok(example.why.trim(), "example why")
        assert.ok(!("statement" in def), "statement field removed")
      })

      it("uses the param keys in every sample, hidden test and example", () => {
        def.samples.forEach((input, i) => assertInputKeys(def, input, `sample ${i + 1}`))
        def.hiddens.forEach((input, i) => assertInputKeys(def, input, `hidden ${i + 1}`))
        def.examples.forEach((example, i) => assertInputKeys(def, example.input, `example ${i + 1}`))
        assert.ok(def.samples.length > 0 && def.hiddens.length > 0, "samples and hiddens")
      })

      it("round-trips stored cases through positional arguments", () => {
        const cases = [...serializeCases(def.samples, def, true), ...serializeCases(def.hiddens, def, false)]
        for (const test of cases) {
          const args = toSolveArgs(test.input)
          assert.equal(args.length, def.params.length, `${def.seedKey} arg count`)
          const rebuilt = Object.fromEntries(def.params.map((param, i) => [param.name, args[i]]))
          assert.equal(JSON.stringify(def.solve(rebuilt)), test.expectedOutput, `${def.seedKey} ${test.input}`)
        }
      })

      it("generates a statement with the positional signature", () => {
        const statement = buildStatement(def)
        assert.ok(!statement.includes("solve(input)"), "no solve(input)")
        assert.ok(statement.includes(solveSignature(def.params)), "signature")
      })
    })
  }
})
