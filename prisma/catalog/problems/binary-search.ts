import type { CatalogProblemDef } from "../types.js"

// Binary search
export const binarySearchProblems: CatalogProblemDef[] = [
  {
    seedKey: "binsearch-first-bad",
    title: "Binsearch First Bad Build",
    story:
      "A toy factory made `n` versions of a robot, numbered 1, 2, 3, ... up to `n`.\n\nAt some point a mistake crept in. From that version on, **every** robot is broken. All versions before it work fine.\n\nVersion `bad` is the first broken one. Pretend you have a tester that says \"broken\" for any version `v` where `v >= bad`. Use it to find the first broken version. A smart way is to test the middle version and throw away the half you do not need.",
    params: [
      { name: "n", type: "number", about: "how many versions there are, numbered from 1 to `n`." },
      { name: "bad", type: "number", about: "the first broken version, used to simulate the tester." },
    ],
    returns: { type: "number", about: "the number of the first broken version." },
    rules: ["Versions are numbered starting from 1, not 0.", "Every version from `bad` up to `n` is broken; every version before `bad` works.", "`bad` is always between 1 and `n`."],
    examples: [
      { input: { n: 5, bad: 4 }, why: "Versions 1, 2 and 3 work, and 4 and 5 are broken. The first broken one is 4." },
      { input: { n: 10, bad: 1 }, why: "Even version 1 is broken, so the answer is 1." },
      { input: { n: 1, bad: 1 }, why: "There is only one version, and it is broken, so the answer is 1." },
    ],
    difficulty: "EASY",
    tags: ["binary-search"],
    samples: [{"n":5,"bad":4},{"n":1,"bad":1}],
    hiddens: [{"n":10,"bad":1},{"n":10,"bad":10},{"n":7,"bad":3},{"n":2,"bad":2}],
    solve: (input) => {
    let lo = 1
    let hi = input.n
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (mid >= input.bad) hi = mid
      else lo = mid + 1
    }
    return lo
  },
  },
  {
    seedKey: "binsearch-insert-pos",
    title: "Binsearch Insert Position",
    story:
      "Books on a shelf have numbers on their spines. They are **sorted** (arranged from smallest to biggest), and no two books share a number.\n\nYou are holding a book with number `target`. If that number is already on the shelf, point to where it is. If not, point to the spot where you would slide your book in so the shelf stays sorted.\n\nSpots are counted from 0, so the first book is at spot 0.",
    params: [
      { name: "nums", type: "number[]", about: "the book numbers on the shelf, from smallest to biggest." },
      { name: "target", type: "number", about: "the number on the book you are holding." },
    ],
    returns: { type: "number", about: "the spot of `target` if it is on the shelf, or the spot where it should be inserted to keep the shelf sorted." },
    rules: ["`nums` is sorted from smallest to biggest, and all numbers are different.", "Spots are counted from 0.", "If `target` is bigger than every book, the answer is the length of `nums` (the end of the shelf).", "An empty shelf gives `0`."],
    examples: [
      { input: { nums: [1, 3, 5, 6], target: 5 }, why: "5 is already on the shelf at spot 2." },
      { input: { nums: [1, 3, 5, 6], target: 2 }, why: "2 is not on the shelf. It belongs between 1 and 3, which is spot 1." },
      { input: { nums: [], target: 1 }, why: "The shelf is empty, so the book goes at spot 0." },
    ],
    difficulty: "EASY",
    tags: ["array","binary-search"],
    samples: [{"nums":[1,3,5,6],"target":5},{"nums":[1,3,5,6],"target":2}],
    hiddens: [{"nums":[],"target":1},{"nums":[1],"target":0},{"nums":[1,3,5,6],"target":7},{"nums":[1,3],"target":3}],
    solve: (input) => {
    let lo = 0
    let hi = input.nums.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (input.nums[mid] < input.target) lo = mid + 1
      else hi = mid
    }
    return lo
  },
  },
  {
    seedKey: "binsearch-rotated-min",
    title: "Binsearch Rotated Minimum",
    story:
      "Numbered train cars were lined up **sorted** (from smallest to biggest), like 1, 2, 3, 4, 5.\n\nThen someone unhooked a few cars from the front and attached them to the back. Now the line might look like 3, 4, 5, 1, 2. This is called a **rotation**.\n\nFind the smallest number in the train. A smart way is to look at the middle car and figure out which half the smallest car must be in.",
    params: [{ name: "nums", type: "number[]", about: "the car numbers after the rotation, from front to back." }],
    returns: { type: "number", about: "the smallest number in `nums`." },
    rules: ["`nums` has at least one number.", "All numbers are different.", "The train may not have been rotated at all, so it can still be fully sorted."],
    examples: [
      { input: { nums: [3, 4, 5, 1, 2] }, why: "The sorted train 1, 2, 3, 4, 5 had cars 1 and 2 moved to the back. The smallest car is still 1." },
      { input: { nums: [1, 2, 3] }, why: "The train was not rotated, so the smallest car is still the first one, 1." },
      { input: { nums: [1] }, why: "There is only one car, so the smallest is 1." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","binary-search"],
    samples: [{"nums":[3,4,5,1,2]},{"nums":[4,5,6,7,0,1,2]}],
    hiddens: [{"nums":[1]},{"nums":[2,1]},{"nums":[1,2,3]},{"nums":[5,1,2,3,4]}],
    solve: (input) => {
    const nums = input.nums
    let lo = 0
    let hi = nums.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (nums[mid] > nums[hi]) lo = mid + 1
      else hi = mid
    }
    return nums[lo]
  },
  },
  {
    seedKey: "binsearch-capacity-ship",
    title: "Binsearch Ship Capacity",
    story:
      "A boat carries packages across a river, one trip per day. The packages wait in a line, and they must go **in that order**.\n\nEach day the boat loads packages from the front of the line until the next one would make it too heavy. Then it sails. The heaviest load the boat can carry is its **capacity**.\n\nAll packages must be across within `days` days. What is the smallest capacity that makes this possible?",
    params: [
      { name: "weights", type: "number[]", about: "the weight of each package, in the order they must be shipped." },
      { name: "days", type: "number", about: "how many days you have to ship everything." },
    ],
    returns: { type: "number", about: "the smallest boat capacity that ships every package within `days` days." },
    rules: ["Packages must be shipped in the given order; you cannot reorder them.", "A package cannot be split across two days.", "`weights` has at least one package, and `days` is at least 1.", "The capacity must be at least as big as the heaviest single package."],
    examples: [
      { input: { weights: [3, 2, 2, 4, 1, 4], days: 3 }, why: "With capacity 6 the days are [3, 2], [2, 4] and [1, 4], which is 3 days. Capacity 5 would need 4 days, so the answer is 6." },
      { input: { weights: [1, 2, 3], days: 1 }, why: "Everything must go in one trip, so the boat must hold 1 + 2 + 3 = 6." },
      { input: { weights: [10], days: 1 }, why: "There is one package weighing 10, so the boat needs capacity 10." },
    ],
    difficulty: "HARD",
    tags: ["binary-search","greedy","array"],
    samples: [{"weights":[1,2,3,4,5,6,7,8,9,10],"days":5},{"weights":[3,2,2,4,1,4],"days":3}],
    hiddens: [{"weights":[1,2,3],"days":1},{"weights":[1,2,3],"days":3},{"weights":[10],"days":1},{"weights":[1,2,3,1,1],"days":4}],
    solve: (input) => {
    const can = (cap) => {
      let days = 1
      let load = 0
      for (const w of input.weights) {
        if (load + w > cap) {
          days++
          load = 0
        }
        load += w
      }
      return days <= input.days
    }
    let lo = Math.max(...input.weights)
    let hi = input.weights.reduce((a, b) => a + b, 0)
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (can(mid)) hi = mid
      else lo = mid + 1
    }
    return lo
  },
  },
  {
    seedKey: "binsearch-median-two",
    title: "Binsearch Twin Median",
    story:
      "Two classes lined up by height. Each line is **sorted** (from shortest to tallest).\n\nNow both classes merge into one big line, still sorted. The teacher wants the **median** height: the middle value of the big line.\n\nIf the big line has an odd number of kids, the median is the kid exactly in the middle. If it is even, there are two middle kids, and the median is their **average** (add them and divide by 2).",
    params: [
      { name: "a", type: "number[]", about: "the heights in the first class, from shortest to tallest." },
      { name: "b", type: "number[]", about: "the heights in the second class, from shortest to tallest." },
    ],
    returns: { type: "number", about: "the median of all the numbers in `a` and `b` together." },
    rules: ["`a` and `b` are each sorted from smallest to biggest.", "One of the lists may be empty.", "The answer can be a decimal, like `2.5`.", "If both lists are empty, return `0`."],
    examples: [
      { input: { a: [1, 3], b: [2] }, why: "Together the line is 1, 2, 3. The middle value is 2." },
      { input: { a: [1, 2], b: [3, 4] }, why: "Together the line is 1, 2, 3, 4. The two middle values are 2 and 3, and their average is 2.5." },
      { input: { a: [], b: [1] }, why: "The first class is empty, so the line is just 1 and the median is 1." },
    ],
    difficulty: "HARD",
    tags: ["array","binary-search"],
    samples: [{"a":[1,3],"b":[2]},{"a":[1,2],"b":[3,4]}],
    hiddens: [{"a":[],"b":[1]},{"a":[2],"b":[]},{"a":[0,0],"b":[0,0]},{"a":[1,2,5],"b":[3,4,6]}],
    solve: (input) => {
    const merged = [...input.a, ...input.b].sort((x, y) => x - y)
    const n = merged.length
    if (!n) return 0
    if (n % 2) return merged[(n / 2) | 0]
    return (merged[n / 2 - 1] + merged[n / 2]) / 2
  },
  },
  {
    seedKey: "binsearch-koko-bananas",
    title: "Binsearch Koko Pace",
    story:
      "Koko the monkey has some piles of bananas and `h` hours before the zookeeper comes back.\n\nKoko picks an eating **speed**: how many bananas she eats per hour. Each hour she picks one pile and eats up to that many bananas from it. If the pile has fewer bananas left, she finishes it and rests for the rest of that hour.\n\nSo a pile of 7 at speed 3 takes 3 hours (3 + 3 + 1). Koko is lazy. What is the **slowest** speed that still lets her finish every pile within `h` hours?",
    params: [
      { name: "piles", type: "number[]", about: "how many bananas are in each pile." },
      { name: "h", type: "number", about: "how many hours Koko has to eat everything." },
    ],
    returns: { type: "number", about: "the smallest whole-number speed that lets Koko finish all piles within `h` hours." },
    rules: ["Each pile takes (pile divided by speed, rounded up) hours.", "Koko eats from only one pile per hour.", "`piles` has at least one pile, and `h` is at least the number of piles.", "The speed is a whole number of at least 1."],
    examples: [
      { input: { piles: [3, 6, 7, 11], h: 8 }, why: "At speed 4 the piles take 1 + 2 + 2 + 3 = 8 hours, which fits. Speed 3 would take 10 hours, so the answer is 4." },
      { input: { piles: [100], h: 2 }, why: "Eating 50 per hour finishes the pile in exactly 2 hours. Speed 49 would need 3 hours." },
      { input: { piles: [1, 1, 1], h: 3 }, why: "Each pile has 1 banana, so speed 1 takes 3 hours, which fits." },
    ],
    difficulty: "MEDIUM",
    tags: ["binary-search","math"],
    samples: [{"piles":[3,6,7,11],"h":8},{"piles":[30,11,23,4,20],"h":5}],
    hiddens: [{"piles":[1],"h":1},{"piles":[1,1,1],"h":3},{"piles":[100],"h":2},{"piles":[10,10,10],"h":6}],
    solve: (input) => {
    const ok = (k) => {
      let hours = 0
      for (const p of input.piles) hours += Math.ceil(p / k)
      return hours <= input.h
    }
    let lo = 1
    let hi = Math.max(...input.piles)
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (ok(mid)) hi = mid
      else lo = mid + 1
    }
    return lo
  },
  },
]
