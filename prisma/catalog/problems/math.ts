import type { CatalogProblemDef } from "../types.js"

// Math
export const mathProblems: CatalogProblemDef[] = [
  {
    seedKey: "math-pow-x-n",
    title: "Math Rapid Power",
    story:
      "A magic bean doubles every night. After 10 nights, one bean has become 2 x 2 x 2 ... (ten times) = 1024 beans.\n\nMultiplying a number `x` by itself `n` times is called a **power**, written x to the power n. Your job is to work it out.\n\nThe power can also be **negative**. A negative power means \"divide instead of multiply\": x to the power -2 is 1 / (x x x). And any number to the power 0 is 1. Try to be quick: squaring the number and halving the power saves lots of steps.",
    params: [
      { name: "x", type: "number", about: "the number to multiply by itself. It may have a decimal part or be negative." },
      { name: "n", type: "number", about: "the power: a whole number that may be negative, zero or positive." },
    ],
    returns: { type: "number", about: "`x` raised to the power `n`." },
    rules: [
      "`n` is always a whole number, but it can be negative.",
      "Anything to the power `0` is `1`.",
      "A negative power means 1 divided by the positive power.",
      "Answers with decimals are compared as normal numbers.",
    ],
    examples: [
      { input: { x: 2, n: 10 }, why: "Multiply ten 2s together: 2 x 2 x ... x 2 = 1024." },
      { input: { x: 2, n: -2 }, why: "The power is negative, so take 1 / (2 x 2) = 1 / 4 = 0.25." },
      { input: { x: -2, n: 3 }, why: "(-2) x (-2) x (-2) = -8. An odd number of negatives stays negative." },
    ],
    difficulty: "MEDIUM",
    tags: ["math","recursion"],
    samples: [{"x":2,"n":10},{"x":2.1,"n":3}],
    hiddens: [{"x":2,"n":-2},{"x":1,"n":0},{"x":-2,"n":3},{"x":0.5,"n":2}],
    solve: (input) => {
    let x = input.x
    let n = input.n
    if (n < 0) {
      x = 1 / x
      n = -n
    }
    let ans = 1
    while (n) {
      if (n & 1) ans *= x
      x *= x
      n = Math.floor(n / 2)
    }
    return ans
  },
  },
  {
    seedKey: "math-sqrt-int",
    title: "Math Integer Square Root",
    story:
      "You have `x` floor tiles and want to build the biggest square patio you can, like 3 tiles by 3 tiles.\n\nA square that is `s` tiles wide uses `s x s` tiles. Find the biggest `s` whose square fits into your `x` tiles. Leftover tiles are fine.\n\nThis is the **square root** of `x`, rounded down to a whole number.",
    params: [{ name: "x", type: "number", about: "how many tiles you have. It is a whole number and never negative." }],
    returns: { type: "number", about: "the biggest whole number `s` with `s x s` no more than `x`." },
    rules: [
      "`x` is a whole number, `0` or bigger.",
      "Round down: if the square root is not a whole number, drop the decimal part.",
      "Try not to use a built-in square root function.",
    ],
    examples: [
      { input: { x: 8 }, why: "2 x 2 = 4 fits, but 3 x 3 = 9 is too many, so the answer is 2." },
      { input: { x: 4 }, why: "2 x 2 = 4 uses every tile exactly, so the answer is 2." },
      { input: { x: 0 }, why: "With no tiles, the biggest square is 0 wide." },
    ],
    difficulty: "EASY",
    tags: ["math","binary-search"],
    samples: [{"x":4},{"x":8}],
    hiddens: [{"x":0},{"x":1},{"x":2147395599},{"x":2}],
    solve: (input) => {
    if (input.x < 2) return input.x
    let lo = 1
    let hi = input.x
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const sq = mid * mid
      if (sq === input.x) return mid
      if (sq < input.x) lo = mid + 1
      else hi = mid - 1
    }
    return hi
  },
  },
  {
    seedKey: "math-happy-number",
    title: "Math Happy Orbit",
    story:
      "Here is a number game. Take a number, split it into its digits, square each digit, and add them up. That gives you a new number. Then do it again, and again.\n\nFor example, 19 becomes 1x1 + 9x9 = 82. Then 82 becomes 8x8 + 2x2 = 68, and so on.\n\nIf you eventually land on 1, the number is **happy**. If you start going around in a loop forever without ever reaching 1, it is not happy.",
    params: [{ name: "n", type: "number", about: "the starting number. It is a positive whole number." }],
    returns: { type: "boolean", about: "`true` if the game reaches 1, otherwise `false`." },
    rules: [
      "`n` is a positive whole number.",
      "If you see a number you have already seen before, you are stuck in a loop, so the answer is `false`.",
      "`1` is already happy.",
    ],
    examples: [
      { input: { n: 19 }, why: "19 -> 82 -> 68 -> 100 -> 1. We reached 1, so 19 is happy." },
      { input: { n: 2 }, why: "2 -> 4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4. We are back at 4 and stuck in a loop, so 2 is not happy." },
      { input: { n: 1 }, why: "We are already at 1, so it is happy." },
    ],
    difficulty: "EASY",
    tags: ["math","hash-set"],
    samples: [{"n":19},{"n":2}],
    hiddens: [{"n":1},{"n":7},{"n":4},{"n":10}],
    solve: (input) => {
    const seen = new Set()
    let n = input.n
    while (n !== 1 && !seen.has(n)) {
      seen.add(n)
      let sum = 0
      while (n) {
        const d = n % 10
        sum += d * d
        n = (n / 10) | 0
      }
      n = sum
    }
    return n === 1
  },
  },
  {
    seedKey: "math-trailing-zeros",
    title: "Math Factorial Trailing Zeros",
    story:
      "The **factorial** of `n`, written `n!`, means multiplying every whole number from 1 up to `n`. So 5! = 1 x 2 x 3 x 4 x 5 = 120.\n\nFactorials get huge very fast, and they often end with a bunch of zeros. 120 ends with one zero. 10! = 3628800 ends with two zeros.\n\nCount how many zeros are at the end of `n!`. Hint: every zero at the end comes from a 2 x 5, and there are always more 2s than 5s.",
    params: [{ name: "n", type: "number", about: "the number whose factorial you look at. It is a whole number, 0 or bigger." }],
    returns: { type: "number", about: "how many zeros are at the end of `n!`." },
    rules: [
      "`n` is a whole number, `0` or bigger.",
      "`0!` is `1`, which has no zeros at the end.",
      "Only count zeros at the very end, not zeros in the middle.",
    ],
    examples: [
      { input: { n: 5 }, why: "5! = 120, which ends with one zero." },
      { input: { n: 25 }, why: "Numbers 5, 10, 15, 20 and 25 each give a 5, and 25 = 5 x 5 gives an extra one. That makes 6 zeros." },
      { input: { n: 3 }, why: "3! = 6, which has no zero at the end." },
    ],
    difficulty: "MEDIUM",
    tags: ["math"],
    samples: [{"n":3},{"n":5}],
    hiddens: [{"n":0},{"n":10},{"n":25},{"n":100}],
    solve: (input) => {
    let c = 0
    for (let p = 5; p <= input.n; p *= 5) c += Math.floor(input.n / p)
    return c
  },
  },
  {
    seedKey: "math-excel-title",
    title: "Math Excel Column Title",
    story:
      "In a spreadsheet, the columns have letter names instead of numbers. Column 1 is A, column 2 is B, all the way to column 26, which is Z.\n\nAfter Z, the names get two letters: column 27 is AA, column 28 is AB, and so on up to ZZ. Then come three letters: AAA, AAB, ...\n\nGiven a column number, find its letter name.",
    params: [{ name: "n", type: "number", about: "the column number, counting from 1." }],
    returns: { type: "string", about: "the column's name in capital letters." },
    rules: [
      "Columns start at 1, so `1` is `A` (there is no column 0).",
      "`n` is always at least `1`.",
      "Use capital letters A to Z.",
    ],
    examples: [
      { input: { n: 28 }, why: "Columns 1 to 26 are A to Z. Column 27 is AA, so column 28 is AB." },
      { input: { n: 26 }, why: "Column 26 is the last one-letter name: Z." },
      { input: { n: 1 }, why: "The very first column is A." },
    ],
    difficulty: "EASY",
    tags: ["math","string"],
    samples: [{"n":1},{"n":28}],
    hiddens: [{"n":26},{"n":27},{"n":701},{"n":52}],
    solve: (input) => {
    let n = input.n
    let s = ""
    while (n > 0) {
      n--
      s = String.fromCharCode(65 + (n % 26)) + s
      n = Math.floor(n / 26)
    }
    return s
  },
  },
]
