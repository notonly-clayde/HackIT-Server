import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  normalizeTestInput,
  normalizeTestValue,
  parseArgLines,
  parseTestLiteral,
  parseTestValue,
  toSolveArgs,
} from "./parse-test-value.js"

describe("parseTestLiteral", () => {
  it("parses numbers, booleans and null", () => {
    assert.equal(parseTestLiteral("42"), 42)
    assert.equal(parseTestLiteral("-3.5"), -3.5)
    assert.equal(parseTestLiteral("true"), true)
    assert.equal(parseTestLiteral("false"), false)
    assert.equal(parseTestLiteral("null"), null)
  })

  it("keeps a JSON-quoted number as a string", () => {
    assert.equal(parseTestLiteral('"42"'), "42")
  })

  it("parses arrays and objects", () => {
    assert.deepEqual(parseTestLiteral("[1,2,3]"), [1, 2, 3])
    assert.deepEqual(parseTestLiteral('{"nums":[1]}'), { nums: [1] })
  })

  it("parses JS-style objects with unquoted keys, single quotes and trailing commas", () => {
    assert.deepEqual(parseTestLiteral("{nums: [1,2,3]}"), { nums: [1, 2, 3] })
    assert.deepEqual(parseTestLiteral("{ 'a': 1, }"), { a: 1 })
    assert.deepEqual(parseTestLiteral("['x', 'y',]"), ["x", "y"])
  })

  it("strips surrounding quotes from strings", () => {
    assert.equal(parseTestLiteral('"abc"'), "abc")
    assert.equal(parseTestLiteral("'abc'"), "abc")
    assert.equal(parseTestLiteral("'don't'"), "don't")
  })

  it("treats unquoted text as a string", () => {
    assert.equal(parseTestLiteral("hello"), "hello")
    assert.equal(parseTestLiteral("  hello world  "), "hello world")
  })

  it("rejects malformed objects and arrays", () => {
    assert.throws(() => parseTestLiteral("{nums:"), /Invalid object\/array literal/)
    assert.throws(() => parseTestLiteral("[1,2"), /Invalid object\/array literal/)
  })

  it("is lenient through parseTestValue for legacy data", () => {
    assert.equal(parseTestValue("{nums:"), "{nums:")
  })
})

describe("line mode", () => {
  it("parses one argument per line, skipping blank lines", () => {
    assert.deepEqual(parseArgLines("[2,7,11,15]\n\n9\r\n"), [[2, 7, 11, 15], 9])
  })

  it("reports the failing line", () => {
    assert.throws(() => parseArgLines("1\n[1,"), /Line 2/)
  })

  it("normalizes lines to an argument list", () => {
    assert.equal(normalizeTestInput("[2,7,11,15]\n9", "lines"), "[[2,7,11,15],9]")
    assert.equal(normalizeTestInput("[1,2,3]", "lines"), "[[1,2,3]]")
    assert.equal(normalizeTestInput("'abc'\nhello", "lines"), '["abc","hello"]')
  })

  it("requires at least one line", () => {
    assert.throws(() => normalizeTestInput("  \n ", "lines"), /at least one/)
  })
})

describe("json mode", () => {
  it("keeps objects and primitives as a single value", () => {
    assert.equal(normalizeTestInput("{nums: [1,2]}", "json"), '{"nums":[1,2]}')
    assert.equal(normalizeTestInput("hello", "json"), '"hello"')
    assert.equal(normalizeTestInput("", "json"), "")
  })

  it("rejects multiple lines instead of storing them as one string", () => {
    assert.throws(() => normalizeTestInput("6\n3", "json"), /Switch the input format to Lines/)
  })

  it("wraps a lone array so it is passed as one argument", () => {
    assert.equal(normalizeTestInput("[1,2,3]", "json"), "[[1,2,3]]")
  })

  it("canonicalizes expected output", () => {
    assert.equal(normalizeTestValue("{a: 1}"), '{"a":1}')
    assert.equal(normalizeTestValue("'yes'"), '"yes"')
    assert.equal(normalizeTestValue("7"), "7")
  })
})

describe("toSolveArgs", () => {
  it("spreads argument lists", () => {
    assert.deepEqual(toSolveArgs("[[2,7,11,15],9]"), [[2, 7, 11, 15], 9])
  })

  it("passes legacy objects as a single argument", () => {
    assert.deepEqual(toSolveArgs('{"nums":[3,6,9,1]}'), [{ nums: [3, 6, 9, 1] }])
  })

  it("splits multi-line text into one typed argument per line", () => {
    assert.deepEqual(toSolveArgs("6\n3"), [6, 3])
    assert.deepEqual(toSolveArgs('"6\\n3"'), [6, 3])
    assert.deepEqual(toSolveArgs("3\n1 2 3"), [3, "1 2 3"])
  })

  it("keeps an explicit multi-line string argument from line mode intact", () => {
    assert.deepEqual(toSolveArgs('["6\\n3"]'), ["6\n3"])
  })

  it("passes single-line plain text as one string argument", () => {
    assert.deepEqual(toSolveArgs("hello"), ["hello"])
  })
})
