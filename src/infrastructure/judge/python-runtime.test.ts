import assert from "node:assert/strict"
import { after, describe, it } from "node:test"
import { CodeJudgeService } from "../../application/services/code-judge.service.js"
import { pythonRuntime } from "./python-runtime.js"

const judge = new CodeJudgeService()
const subtractCases = [
  { input: "[6,3]", expectedOutput: "3" },
  { input: "[10,4]", expectedOutput: "6" },
]

after(() => pythonRuntime.dispose())

describe("python judge (pyodide)", () => {
  it("accepts a positional solve(a, b)", async () => {
    const verdict = await judge.judge("python", "def solve(a, b):\n    return a - b\n", subtractCases, 2000)
    assert.equal(verdict.status, "accepted")
    assert.equal(verdict.cases.length, 2)
  })

  it("reports a wrong answer with the actual value", async () => {
    const verdict = await judge.judge("python", "def solve(a, b):\n    return a + b\n", subtractCases, 2000)
    assert.equal(verdict.status, "wrong_answer")
    assert.equal(verdict.cases[0]?.actual, "9")
  })

  it("reports exceptions raised by the solution", async () => {
    const verdict = await judge.judge("python", "def solve(a, b):\n    raise ValueError('boom')\n", subtractCases, 2000)
    assert.equal(verdict.status, "wrong_answer")
    assert.equal(verdict.cases[0]?.error, "boom")
  })

  it("reports syntax errors as runtime errors without pyodide internals", async () => {
    const verdict = await judge.judge("python", "def solve(a, b)\n    return a\n", subtractCases, 2000)
    assert.equal(verdict.status, "runtime_error")
    assert.match(verdict.message ?? "", /SyntaxError/)
    assert.doesNotMatch(verdict.message ?? "", /_pyodide/)
  })

  it("times out infinite loops and keeps working afterwards", async () => {
    const verdict = await judge.judge("python", "def solve(a, b):\n    while True:\n        pass\n", subtractCases, 300)
    assert.equal(verdict.status, "timeout")

    const next = await judge.judge("python", "def solve(a, b):\n    return a - b\n", subtractCases, 2000)
    assert.equal(next.status, "accepted")
  })

  it("treats tuples as lists and compares numbers by value", async () => {
    const pairs = await judge.judge(
      "python",
      "def solve(nums):\n    return (nums[0], nums[-1])\n",
      [{ input: "[[1,2,3]]", expectedOutput: "[1,3]" }],
      2000,
    )
    assert.equal(pairs.status, "accepted")

    const floats = await judge.judge(
      "python",
      "def solve(a, b):\n    return (a - b) * 1.0\n",
      subtractCases,
      2000,
    )
    assert.equal(floats.status, "accepted")
  })

  it("does not leak globals between runs", async () => {
    await judge.judge("python", "leak = 1\ndef solve(a, b):\n    return a - b\n", subtractCases, 2000)
    const verdict = await judge.judge("python", "def solve(a, b):\n    return leak\n", subtractCases, 2000)
    assert.equal(verdict.status, "wrong_answer")
    assert.match(verdict.cases[0]?.error ?? "", /leak/)
  })
})
