import type { CatalogProblemDef } from "../types.js"

// Bit manipulation
export const bitManipulationProblems: CatalogProblemDef[] = [
  {
    seedKey: "bit-single-number",
    title: "Bit Lone Pulse",
    story:
      "Socks come out of the dryer, and every sock has a matching twin. Well, almost every sock. One sock is all alone!\n\nEach sock has a number. Find the number of the lonely sock.\n\nA cool trick is **XOR** (a switch flip: 1 if the bits differ, 0 if they match). XOR-ing a number with itself gives 0, so all the pairs cancel out and only the lonely number is left.",
    params: [{ name: "nums", type: "number[]", about: "the sock numbers, where every number shows up twice except one." }],
    returns: { type: "number", about: "the number that shows up only once." },
    rules: ["Exactly one number appears once; every other number appears exactly twice.", "The list is never empty."],
    examples: [
      { input: { nums: [4, 1, 2, 1, 2] }, why: "The 1s pair up and the 2s pair up. Only 4 is left alone." },
      { input: { nums: [1] }, why: "There is just one sock, so it is the lonely one: 1." },
    ],
    difficulty: "EASY",
    tags: ["bit-manipulation","array"],
    samples: [{"nums":[2,2,1]},{"nums":[4,1,2,1,2]}],
    hiddens: [{"nums":[1]},{"nums":[0,1,0]},{"nums":[7,3,7]},{"nums":[5,5,9,9,2]}],
    solve: (input) => input.nums.reduce((a, b) => a ^ b, 0),
  },
  {
    seedKey: "bit-hamming-weight",
    title: "Bit Hamming Weight",
    story:
      "Computers store numbers in **binary** (writing numbers with only 0s and 1s, like light switches off and on).\n\nPicture a row of 32 light switches that spell out the number `n`. Each 1 is a switch that is **on** (also called a **set bit**).\n\nCount how many switches are on.",
    params: [{ name: "n", type: "number", about: "the number to look at, as an unsigned 32-bit number (0 up to 4294967295)." }],
    returns: { type: "number", about: "how many 1s are in the binary form of `n`." },
    rules: ["Treat `n` as **unsigned** (never negative), using exactly 32 bits."],
    examples: [
      { input: { n: 11 }, why: "11 in binary is 1011. That has three 1s, so the answer is 3." },
      { input: { n: 128 }, why: "128 in binary is 10000000. Only one switch is on, so the answer is 1." },
      { input: { n: 0 }, why: "0 has every switch off, so the answer is 0." },
    ],
    difficulty: "EASY",
    tags: ["bit-manipulation"],
    samples: [{"n":11},{"n":128}],
    hiddens: [{"n":0},{"n":1},{"n":4294967295},{"n":255}],
    solve: (input) => {
    let n = input.n >>> 0
    let c = 0
    while (n) {
      c += n & 1
      n >>>= 1
    }
    return c
  },
  },
  {
    seedKey: "bit-reverse-bits",
    title: "Bit Reverse Mirror",
    story:
      "Write the number `n` in **binary** (only 0s and 1s, like light switches off and on), using exactly 32 switches. Add 0s on the left if needed.\n\nNow hold that row of switches up to a mirror. The first switch becomes the last, and the last becomes the first.\n\nWhat number does the mirrored row spell?",
    params: [{ name: "n", type: "number", about: "the number to mirror, as an unsigned 32-bit number (0 up to 4294967295)." }],
    returns: { type: "number", about: "the number you get after flipping the order of all 32 bits, as an unsigned number." },
    rules: ["Always use all 32 bits, including the 0s on the left.", "The answer is **unsigned** (never negative)."],
    examples: [
      { input: { n: 1 }, why: "1 is 31 zeros followed by a 1. Mirrored, the 1 moves to the far left, which is 2147483648." },
      { input: { n: 43261596 }, why: "In 32 bits this is 00000010100101000001111010011100. Mirrored it is 00111001011110000010100101000000, which is 964176192." },
      { input: { n: 0 }, why: "All switches are off, and mirroring them still leaves them all off, so the answer is 0." },
    ],
    difficulty: "EASY",
    tags: ["bit-manipulation"],
    samples: [{"n":43261596},{"n":4294967293}],
    hiddens: [{"n":0},{"n":1},{"n":2},{"n":2147483648}],
    solve: (input) => {
    let n = input.n >>> 0
    let r = 0
    for (let i = 0; i < 32; i++) {
      r = (r << 1) | (n & 1)
      n >>>= 1
    }
    return r >>> 0
  },
  },
  {
    seedKey: "bit-range-bitwise-and",
    title: "Bit Range And Collapse",
    story:
      "Every number can be written in **binary** (only 0s and 1s, like light switches off and on).\n\n**AND** is a strict rule: a switch stays on only if it is on in **every** number. If even one number has it off, it turns off.\n\nTake every whole number from `left` to `right` and AND them all together. Which switches survive? Hint: only the switches on the left that all the numbers share can stay on.",
    params: [
      { name: "left", type: "number", about: "the first number in the range." },
      { name: "right", type: "number", about: "the last number in the range." },
    ],
    returns: { type: "number", about: "the AND of every number from `left` to `right`." },
    rules: ["The range includes both `left` and `right`.", "`0 <= left <= right <= 2147483647`."],
    examples: [
      { input: { left: 5, right: 7 }, why: "5, 6 and 7 are 101, 110 and 111. Only the leftmost switch is on in all of them, so the answer is 100, which is 4." },
      { input: { left: 12, right: 12 }, why: "There is only one number, so the answer is that number: 12." },
      { input: { left: 0, right: 0 }, why: "The only number is 0, so the answer is 0." },
    ],
    difficulty: "MEDIUM",
    tags: ["bit-manipulation"],
    samples: [{"left":5,"right":7},{"left":0,"right":0}],
    hiddens: [{"left":1,"right":2147483647},{"left":8,"right":15},{"left":12,"right":12},{"left":1,"right":2}],
    solve: (input) => {
    let a = input.left
    let b = input.right
    let shift = 0
    while (a < b) {
      a >>= 1
      b >>= 1
      shift++
    }
    return a << shift
  },
  },
]
