import type { CatalogProblemDef } from "../types.js"

// Linked list
export const linkedListProblems: CatalogProblemDef[] = [
  {
    seedKey: "chain-reverse-list",
    title: "Chain Reverse List",
    story:
      "A toy train has cars hooked together, each car carrying a number. The engine is at the front.\n\nThe train is a **linked list** (a chain where each item points to the next). To keep things simple, you get the numbers as an **array** (a list in order), from the front car to the back car.\n\nThe train needs to drive the other way, so the back car becomes the front. List the numbers in the new order.",
    params: [{ name: "vals", type: "number[]", about: "the numbers on the train cars, from front to back." }],
    returns: { type: "number[]", about: "the numbers from the new front to the new back, which is the old order reversed." },
    rules: ["An empty train stays empty.", "Numbers can repeat."],
    examples: [
      { input: { vals: [1, 2, 3, 4, 5] }, why: "The back car 5 becomes the front, then 4, 3, 2, and 1 ends up at the back." },
      { input: { vals: [1] }, why: "A train with one car looks the same either way." },
      { input: { vals: [] }, why: "There are no cars, so the answer is an empty list." },
    ],
    difficulty: "EASY",
    tags: ["linked-list"],
    samples: [{"vals":[1,2,3,4,5]},{"vals":[1,2]}],
    hiddens: [{"vals":[]},{"vals":[1]},{"vals":[5,4,3]},{"vals":[0,0,1]}],
    solve: (input) => [...input.vals].reverse(),
  },
  {
    seedKey: "chain-merge-sorted",
    title: "Chain Merge Sorted",
    story:
      "Two lines of kids are each standing in order of height, shortest first. The teacher wants to join them into **one** line that is still in order.\n\nEach line is a **linked list** (a chain where each item points to the next). You get each one as an **array** (a list in order) of heights.\n\nTip: keep looking at the front kid of each line and send the shorter one next.",
    params: [
      { name: "a", type: "number[]", about: "the heights in the first line, smallest to biggest." },
      { name: "b", type: "number[]", about: "the heights in the second line, smallest to biggest." },
    ],
    returns: { type: "number[]", about: "all the heights from both lines in one list, smallest to biggest." },
    rules: ["Both `a` and `b` are already sorted from smallest to biggest.", "Either line, or both, can be empty.", "Equal heights are all kept."],
    examples: [
      { input: { a: [1, 2, 4], b: [1, 3, 4] }, why: "Always take the smaller front kid: 1, 1, 2, 3, 4, 4." },
      { input: { a: [], b: [0] }, why: "The first line is empty, so the answer is just the second line: 0." },
      { input: { a: [2, 2], b: [2] }, why: "Everyone is the same height, so all three 2s go into the line." },
    ],
    difficulty: "EASY",
    tags: ["linked-list","two-pointers"],
    samples: [{"a":[1,2,4],"b":[1,3,4]},{"a":[],"b":[0]}],
    hiddens: [{"a":[],"b":[]},{"a":[1],"b":[]},{"a":[1,5,9],"b":[2,3,4,8]},{"a":[2,2],"b":[2]}],
    solve: (input) => {
    const out = []
    let i = 0
    let j = 0
    while (i < input.a.length && j < input.b.length) {
      if (input.a[i] <= input.b[j]) out.push(input.a[i++])
      else out.push(input.b[j++])
    }
    while (i < input.a.length) out.push(input.a[i++])
    while (j < input.b.length) out.push(input.b[j++])
    return out
  },
  },
  {
    seedKey: "chain-detect-cycle-index",
    title: "Chain Detect Cycle Index",
    story:
      "A treasure hunt has numbered stops: 0, 1, 2, and so on. Each stop has a sign telling you which stop to visit next. A sign saying `-1` means \"the hunt is over\".\n\nThis is a **linked list** (a chain where each item points to the next). But some hunts are tricky: the signs lead you back to a stop you already visited, and you walk in a circle forever. That circle is called a **cycle**.\n\nYou always start at stop 0. If you get stuck in a cycle, find the first stop of the circle.",
    params: [{ name: "next", type: "number[]", about: "`next[i]` is the stop you go to after stop `i`, or `-1` if the hunt ends there." }],
    returns: { type: "number", about: "the stop where the cycle begins, or `-1` if the hunt ends without a cycle." },
    rules: ["You start at stop `0`.", "Every value in `next` is either `-1` or a valid stop number.", "If `next` is empty there are no stops, so return `-1`.", "A stop can point to itself; that is a cycle of one stop."],
    examples: [
      { input: { next: [1, 2, 3, 1] }, why: "You go 0, 1, 2, 3, then back to 1 and around again. The circle starts at stop 1." },
      { input: { next: [1, 2, -1] }, why: "You go 0, 1, 2, and stop 2 says the hunt is over. There is no cycle, so -1." },
      { input: { next: [0] }, why: "Stop 0 points to itself, so the circle starts right at stop 0." },
    ],
    difficulty: "MEDIUM",
    tags: ["linked-list","two-pointers"],
    samples: [{"next":[1,2,3,1]},{"next":[1,2,-1]}],
    hiddens: [{"next":[]},{"next":[-1]},{"next":[0]},{"next":[1,2,3,4,2]}],
    solve: (input) => {
    const next = input.next
    if (!next.length) return -1
    let slow = 0
    let fast = 0
    while (true) {
      if (slow === -1 || fast === -1 || next[fast] === -1) return -1
      slow = next[slow]
      fast = next[next[fast]]
      if (slow === -1 || fast === -1) return -1
      if (slow === fast) break
    }
    let ptr = 0
    while (ptr !== slow) {
      ptr = next[ptr]
      slow = next[slow]
    }
    return ptr
  },
  },
  {
    seedKey: "chain-remove-nth",
    title: "Chain Remove Nth From End",
    story:
      "A line of ducklings follows their mother, each wearing a number tag. One duckling wanders off to the pond.\n\nYou know it was the `n`-th duckling **counting from the back** of the line. The last duckling is number 1 from the back.\n\nThe line is a **linked list** (a chain where each item points to the next). You get the tags as an **array** (a list in order), front to back.",
    params: [
      { name: "vals", type: "number[]", about: "the duckling tags, from the front of the line to the back." },
      { name: "n", type: "number", about: "which duckling left, counting from the back, where the last duckling is 1." },
    ],
    returns: { type: "number[]", about: "the tags of the ducklings still in line, front to back." },
    rules: ["`n` is at least 1 and at most the number of ducklings.", "Counting from the back starts at 1, not 0."],
    examples: [
      { input: { vals: [1, 2, 3, 4, 5], n: 2 }, why: "Counting from the back: 5 is first, 4 is second. Remove 4 to get 1, 2, 3, 5." },
      { input: { vals: [1, 2, 3], n: 3 }, why: "The 3rd from the back is the front duckling 1, so 2, 3 are left." },
      { input: { vals: [1], n: 1 }, why: "The only duckling leaves, so the line is empty." },
    ],
    difficulty: "MEDIUM",
    tags: ["linked-list","two-pointers"],
    samples: [{"vals":[1,2,3,4,5],"n":2},{"vals":[1],"n":1}],
    hiddens: [{"vals":[1,2],"n":1},{"vals":[1,2],"n":2},{"vals":[1,2,3],"n":3},{"vals":[5,6,7,8],"n":4}],
    solve: (input) => {
    const vals = [...input.vals]
    const idx = vals.length - input.n
    vals.splice(idx, 1)
    return vals
  },
  },
  {
    seedKey: "chain-add-two-numbers",
    title: "Chain Add Two Numbers",
    story:
      "Two robots each store a number as a chain of digit beads. They store it **backwards**: the ones digit comes first, then the tens, then the hundreds. So 342 is stored as 2, 4, 3.\n\nEach chain is a **linked list** (a chain where each item points to the next). You get them as **arrays** (lists in order).\n\nAdd the two numbers, just like adding on paper, and give back the answer stored backwards too. Do not forget to carry!",
    params: [
      { name: "a", type: "number[]", about: "the first number's digits, ones digit first." },
      { name: "b", type: "number[]", about: "the second number's digits, ones digit first." },
    ],
    returns: { type: "number[]", about: "the digits of the sum, ones digit first." },
    rules: ["Each item is a single digit from 0 to 9.", "The two lists can have different lengths.", "An empty list counts as the number 0.", "If there is a carry left at the end, it becomes a new last digit."],
    examples: [
      { input: { a: [2, 4, 3], b: [5, 6, 4] }, why: "That is 342 + 465 = 807, which stored backwards is 7, 0, 8." },
      { input: { a: [9, 9, 9], b: [1] }, why: "999 + 1 = 1000. Each 9 plus a carry makes 0 with a new carry, so the answer is 0, 0, 0, 1." },
      { input: { a: [0], b: [0] }, why: "0 + 0 = 0, so the answer is a single 0." },
    ],
    difficulty: "MEDIUM",
    tags: ["linked-list","math"],
    samples: [{"a":[2,4,3],"b":[5,6,4]},{"a":[0],"b":[0]}],
    hiddens: [{"a":[9,9,9],"b":[1]},{"a":[1,8],"b":[0]},{"a":[],"b":[1,2]},{"a":[5],"b":[5]}],
    solve: (input) => {
    const out = []
    let i = 0
    let carry = 0
    while (i < input.a.length || i < input.b.length || carry) {
      const sum = (input.a[i] || 0) + (input.b[i] || 0) + carry
      out.push(sum % 10)
      carry = (sum / 10) | 0
      i++
    }
    return out
  },
  },
]
