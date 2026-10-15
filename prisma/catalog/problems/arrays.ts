import type { CatalogProblemDef } from "../types.js"

// Arrays
export const arraysProblems: CatalogProblemDef[] = [
  {
    seedKey: "pulse-max-gap",
    title: "Pulse Max Gap",
    story:
      "A heart monitor wrote down some heartbeat numbers, but they got all jumbled up.\n\nYou line the numbers up from smallest to biggest. Then you look at each pair of neighbors and ask: how far apart are they? The doctor wants the **biggest jump** between two neighbors.\n\nYou get the numbers as an **array** (a list of numbers in order).",
    params: [{ name: "nums", type: "number[]", about: "the heartbeat numbers, in any order." }],
    returns: { type: "number", about: "the biggest difference between two neighbors after sorting the numbers from smallest to biggest." },
    rules: ["If there are fewer than two numbers, there are no neighbors, so return `0`.", "Numbers can be negative or repeated."],
    examples: [
      { input: { nums: [3, 6, 9, 1] }, why: "Sorted, the list is 1, 3, 6, 9. The jumps are 2, 3 and 3, so the biggest jump is 3." },
      { input: { nums: [1, 100, 2] }, why: "Sorted, it is 1, 2, 100. The jumps are 1 and 98, so the answer is 98." },
      { input: { nums: [10] }, why: "Only one number means no neighbors, so the answer is 0." },
    ],
    difficulty: "EASY",
    tags: ["array","sorting"],
    samples: [{"nums":[3,6,9,1]},{"nums":[10]}],
    hiddens: [{"nums":[1,100,2]},{"nums":[]},{"nums":[5,5,5]},{"nums":[-3,-1,0]}],
    solve: (input) => {
    const nums = [...input.nums].sort((a, b) => a - b)
    if (nums.length < 2) return 0
    let max = 0
    for (let i = 1; i < nums.length; i++) max = Math.max(max, nums[i] - nums[i - 1])
    return max
  },
  },
  {
    seedKey: "signal-running-product",
    title: "Signal Running Product",
    story:
      "A row of robots each holds a number card.\n\nEach robot wants to know: \"If I hide my own card, what do I get when I **multiply** everyone else's cards together?\"\n\nBuild a new list where spot `i` holds the product of every card except the one at spot `i`. The tricky part: you are **not allowed to divide**. Try keeping a running product from the left and another from the right.",
    params: [{ name: "nums", type: "number[]", about: "the number on each robot's card, from left to right." }],
    returns: { type: "number[]", about: "a list the same length as `nums`, where each spot is the product of all the other numbers." },
    rules: ["Do not use division.", "Numbers can be zero or negative.", "An empty list gives an empty list back.", "A single robot has nobody else, so its answer is `1` (multiplying nothing gives 1)."],
    examples: [
      { input: { nums: [1, 2, 3, 4] }, why: "For spot 0 multiply 2 x 3 x 4 = 24. For spot 1 multiply 1 x 3 x 4 = 12, and so on." },
      { input: { nums: [0, 1, 2] }, why: "Spot 0 hides the zero, so it gets 1 x 2 = 2. Every other spot still includes the zero, so they get 0." },
      { input: { nums: [5] }, why: "There is nobody else to multiply, so the answer is 1." },
    ],
    difficulty: "HARD",
    tags: ["array","prefix-sum"],
    samples: [{"nums":[1,2,3,4]},{"nums":[2,3]}],
    hiddens: [{"nums":[0,1,2]},{"nums":[5]},{"nums":[]},{"nums":[-1,2,-3,4]}],
    solve: (input) => {
    const nums = input.nums
    const n = nums.length
    const out = Array(n).fill(1)
    let left = 1
    for (let i = 0; i < n; i++) {
      out[i] = left
      left *= nums[i]
    }
    let right = 1
    for (let i = n - 1; i >= 0; i--) {
      out[i] *= right
      right *= nums[i]
    }
    return out
  },
  },
  {
    seedKey: "breach-rotate-k",
    title: "Breach Rotate K",
    story:
      "Kids are sitting on a merry-go-round, in order.\n\nEvery time it turns one step to the right, each kid moves one seat to the right. The kid in the last seat wraps around to the first seat.\n\nAfter `k` steps, who is sitting where?",
    params: [
      { name: "nums", type: "number[]", about: "the kids' numbers, from the first seat to the last." },
      { name: "k", type: "number", about: "how many steps the ride turns to the right." },
    ],
    returns: { type: "number[]", about: "the kids' numbers in seat order after `k` steps." },
    rules: ["`k` can be bigger than the number of seats. Turning once all the way around puts everyone back where they started.", "An empty ride stays empty."],
    examples: [
      { input: { nums: [1, 2, 3, 4, 5], k: 2 }, why: "After one step: 5,1,2,3,4. After two steps: 4,5,1,2,3." },
      { input: { nums: [1, 2], k: 3 }, why: "Two seats means every 2 steps is a full circle, so 3 steps is the same as 1 step: 2,1." },
      { input: { nums: [9, 8, 7, 6], k: 4 }, why: "4 steps on 4 seats is exactly one full circle, so nothing changes." },
    ],
    difficulty: "EASY",
    tags: ["array"],
    samples: [{"nums":[1,2,3,4,5],"k":2},{"nums":[1,2],"k":3}],
    hiddens: [{"nums":[],"k":5},{"nums":[7],"k":0},{"nums":[1,2,3],"k":0},{"nums":[9,8,7,6],"k":4}],
    solve: (input) => {
    const nums = [...input.nums]
    const n = nums.length
    if (n === 0) return []
    const k = ((input.k % n) + n) % n
    return nums.slice(n - k).concat(nums.slice(0, n - k))
  },
  },
  {
    seedKey: "forge-missing-span",
    title: "Forge Missing Span",
    story:
      "A box should hold number tiles from `0` up to `n`, one of each.\n\nBut one tile fell out! Now the box has only `n` tiles, all different, in a messy order.\n\nWhich tile is missing?",
    params: [{ name: "nums", type: "number[]", about: "the tiles still in the box. There are `n` of them, each from `0` to `n`, no repeats." }],
    returns: { type: "number", about: "the one tile from `0` to `n` that is not in the box." },
    rules: ["`n` is how many tiles are in the box (the length of `nums`).", "Exactly one tile is missing."],
    examples: [
      { input: { nums: [3, 0, 1] }, why: "There are 3 tiles, so the box should hold 0, 1, 2, 3. The 2 is missing." },
      { input: { nums: [0, 1] }, why: "There are 2 tiles, so the box should hold 0, 1, 2. The 2 is missing." },
      { input: { nums: [1] }, why: "There is 1 tile, so the box should hold 0 and 1. The 0 is missing." },
    ],
    difficulty: "EASY",
    tags: ["array","bit-manipulation","math"],
    samples: [{"nums":[3,0,1]},{"nums":[0,1]}],
    hiddens: [{"nums":[0]},{"nums":[1]},{"nums":[9,6,4,2,3,5,7,0,1]},{"nums":[0,1,2,3]}],
    solve: (input) => {
    const nums = input.nums
    const n = nums.length
    let x = n
    for (let i = 0; i < n; i++) x ^= i ^ nums[i]
    return x
  },
  },
  {
    seedKey: "cacheline-majority-vote",
    title: "Cacheline Majority Vote",
    story:
      "Your class voted for the class pet. Each vote is a number that stands for one pet.\n\nOne pet won by a **majority**: it got more than half of all the votes.\n\nLook at the votes and find the winner.",
    params: [{ name: "nums", type: "number[]", about: "the votes. Each number is one pet." }],
    returns: { type: "number", about: "the pet that got more than half of the votes." },
    rules: ["\"More than half\" means more than `floor(n / 2)` votes, where `n` is the number of votes.", "A winner always exists."],
    examples: [
      { input: { nums: [3, 2, 3] }, why: "There are 3 votes. Pet 3 got 2 of them, which is more than half." },
      { input: { nums: [2, 2, 1, 1, 1, 2, 2] }, why: "Pet 2 got 4 of the 7 votes. Half of 7 is 3.5, and 4 is more than that." },
      { input: { nums: [1] }, why: "One vote, one winner: pet 1." },
    ],
    difficulty: "EASY",
    tags: ["array","greedy"],
    samples: [{"nums":[3,2,3]},{"nums":[2,2,1,1,1,2,2]}],
    hiddens: [{"nums":[1]},{"nums":[5,5,5,1,2]},{"nums":[0,0,0,1]},{"nums":[7,7,8,7,9,7]}],
    solve: (input) => {
    let cand = null
    let count = 0
    for (const x of input.nums) {
      if (count === 0) cand = x
      count += x === cand ? 1 : -1
    }
    return cand
  },
  },
  {
    seedKey: "packet-duplicate-once",
    title: "Packet Duplicate Once",
    story:
      "A mail sorter has letters numbered `1` to `n`. But it counted `n + 1` letters!\n\nThat means exactly one letter number shows up **twice**. Find the copied number.",
    params: [{ name: "nums", type: "number[]", about: "the letter numbers. There are `n + 1` of them, each from `1` to `n`." }],
    returns: { type: "number", about: "the letter number that appears twice." },
    rules: ["Exactly one number repeats; all others appear once."],
    examples: [
      { input: { nums: [1, 3, 4, 2, 2] }, why: "Every number shows up once except 2, which shows up twice." },
      { input: { nums: [3, 1, 3, 4, 2] }, why: "The number 3 appears at the start and again in the middle." },
      { input: { nums: [1, 1] }, why: "With only letter 1, the two letters must both be 1." },
    ],
    difficulty: "EASY",
    tags: ["array","hash-set"],
    samples: [{"nums":[1,3,4,2,2]},{"nums":[3,1,3,4,2]}],
    hiddens: [{"nums":[1,1]},{"nums":[2,2,1]},{"nums":[1,2,3,4,5,3]},{"nums":[5,4,3,2,1,5]}],
    solve: (input) => {
    const seen = new Set()
    for (const x of input.nums) {
      if (seen.has(x)) return x
      seen.add(x)
    }
    return -1
  },
  },
  {
    seedKey: "relay-max-subarray",
    title: "Relay Max Subarray",
    story:
      "In a relay race, each runner either gains points (a positive number) or loses points (a negative number).\n\nThe coach can pick one **team of runners standing next to each other** in line. The team's score is all their points added up.\n\nWhat is the best score a team can get? This kind of \"neighbors only\" group is called a **subarray**.",
    params: [{ name: "nums", type: "number[]", about: "each runner's points, in line order." }],
    returns: { type: "number", about: "the biggest total you can get from runners standing next to each other." },
    rules: ["The team must have at least one runner.", "The line always has at least one runner.", "If every number is negative, the best team is the single least-negative runner."],
    examples: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, why: "The runners 4, -1, 2, 1 stand together and add up to 6. No other group beats that." },
      { input: { nums: [5, 4, -1, 7, 8] }, why: "Taking everyone gives 5 + 4 - 1 + 7 + 8 = 23. The -1 is worth keeping to join both sides." },
      { input: { nums: [-2, -1] }, why: "Everyone loses points, so pick just the runner with -1." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","dynamic-programming"],
    samples: [{"nums":[-2,1,-3,4,-1,2,1,-5,4]},{"nums":[1]}],
    hiddens: [{"nums":[-1]},{"nums":[5,4,-1,7,8]},{"nums":[-2,-1]},{"nums":[0,-3,1,1]}],
    solve: (input) => {
    let best = input.nums[0]
    let cur = input.nums[0]
    for (let i = 1; i < input.nums.length; i++) {
      cur = Math.max(input.nums[i], cur + input.nums[i])
      best = Math.max(best, cur)
    }
    return best
  },
  },
  {
    seedKey: "warp-move-zeros",
    title: "Warp Move Zeros",
    story:
      "You have a shelf of toy boxes. Some boxes are empty, marked `0`.\n\nPush all the empty boxes to the end of the shelf. The full boxes must stay in the **same order** they were in before.",
    params: [{ name: "nums", type: "number[]", about: "the boxes on the shelf, from left to right. `0` means empty." }],
    returns: { type: "number[]", about: "the shelf with all the `0`s moved to the end and the other numbers in their original order." },
    rules: ["Keep the same number of boxes.", "An empty shelf stays empty."],
    examples: [
      { input: { nums: [0, 1, 0, 3, 12] }, why: "The full boxes 1, 3, 12 keep their order, then the two zeros go at the end." },
      { input: { nums: [4, 0, 5, 0, 0, 6] }, why: "Keep 4, 5, 6 in order and put the three zeros last." },
      { input: { nums: [1, 2, 3] }, why: "No empty boxes, so nothing moves." },
    ],
    difficulty: "EASY",
    tags: ["array","two-pointers"],
    samples: [{"nums":[0,1,0,3,12]},{"nums":[0]}],
    hiddens: [{"nums":[]},{"nums":[1,2,3]},{"nums":[0,0,1]},{"nums":[4,0,5,0,0,6]}],
    solve: (input) => {
    const nums = [...input.nums]
    let j = 0
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] !== 0) {
        ;[nums[j], nums[i]] = [nums[i], nums[j]]
        j++
      }
    }
    return nums
  },
  },
  {
    seedKey: "nexus-third-distinct",
    title: "Nexus Third Distinct",
    story:
      "At a sports day, every racer got a score. Some racers tied with the same score.\n\nThe judges give a bronze medal to the **third-highest different score**. Ties count as one score.\n\nIf there are not three different scores, the judges just pick the highest score instead.",
    params: [{ name: "nums", type: "number[]", about: "all the racers' scores." }],
    returns: { type: "number", about: "the third-highest different score, or the highest score if there are fewer than three different scores." },
    rules: ["Repeated scores count once.", "The list has at least one score."],
    examples: [
      { input: { nums: [3, 2, 1] }, why: "The different scores from high to low are 3, 2, 1. The third one is 1." },
      { input: { nums: [2, 2, 3, 1] }, why: "The two 2s count once, so the scores are 3, 2, 1. The third is 1." },
      { input: { nums: [1, 2] }, why: "Only two different scores, so return the highest one: 2." },
    ],
    difficulty: "EASY",
    tags: ["array","sorting"],
    samples: [{"nums":[3,2,1]},{"nums":[1,2]}],
    hiddens: [{"nums":[2,2,3,1]},{"nums":[1,1,1]},{"nums":[5,4,3,2,1]},{"nums":[-1,0,1,2]}],
    solve: (input) => {
    const u = [...new Set(input.nums)].sort((a, b) => b - a)
    return u.length >= 3 ? u[2] : u[0]
  },
  },
  {
    seedKey: "oxide-intersection-sorted",
    title: "Oxide Intersection Sorted",
    story:
      "You and your friend each have a sticker collection. Both collections are sorted from smallest number to biggest.\n\nWhich sticker numbers do you **both** have? List each shared number only once, from smallest to biggest.",
    params: [
      { name: "a", type: "number[]", about: "your sticker numbers, sorted from smallest to biggest (may have repeats)." },
      { name: "b", type: "number[]", about: "your friend's sticker numbers, sorted from smallest to biggest (may have repeats)." },
    ],
    returns: { type: "number[]", about: "the numbers found in both lists, each once, sorted from smallest to biggest." },
    rules: ["If you share nothing, return an empty list `[]`."],
    examples: [
      { input: { a: [1, 2, 2, 3], b: [2, 2, 4] }, why: "Only 2 is in both lists. Even though it repeats, list it once." },
      { input: { a: [0, 2, 4], b: [0, 1, 2, 3, 4] }, why: "0, 2 and 4 are in both lists." },
      { input: { a: [1, 3, 5], b: [2, 4, 6] }, why: "No number is in both lists, so the answer is empty." },
    ],
    difficulty: "EASY",
    tags: ["array","two-pointers","hash-set"],
    samples: [{"a":[1,2,2,3],"b":[2,2,4]},{"a":[1,3,5],"b":[2,4,6]}],
    hiddens: [{"a":[],"b":[1]},{"a":[1,1,1],"b":[1,1]},{"a":[0,2,4],"b":[0,1,2,3,4]},{"a":[5],"b":[5]}],
    solve: (input) => {
    const setB = new Set(input.b)
    const out = []
    let prev = null
    for (const x of input.a) {
      if (x !== prev && setB.has(x)) out.push(x)
      prev = x
    }
    return out
  },
  },
  {
    seedKey: "vector-peak-index",
    title: "Vector Peak Index",
    story:
      "You are hiking over a mountain. The list tells you how high you are at each step.\n\nThe path only goes **up** for a while, then only goes **down**. Find the step where you stand on the very top.\n\nSteps are counted from `0` (the first step is step 0).",
    params: [{ name: "nums", type: "number[]", about: "the height at each step. It strictly goes up, then strictly goes down." }],
    returns: { type: "number", about: "the step number (starting at 0) of the highest point." },
    rules: ["The mountain always has at least one step going up and one going down, so the top is never the first or last step.", "Hint: you can find it faster than checking every step by looking at whether the path goes up or down in the middle."],
    examples: [
      { input: { nums: [0, 1, 0] }, why: "The heights go 0, 1, 0. The top is at step 1." },
      { input: { nums: [0, 2, 1, 0] }, why: "The tallest height, 2, is at step 1." },
      { input: { nums: [0, 1, 2, 3, 2, 1, 0] }, why: "The path climbs to 3 at step 3, then goes down." },
    ],
    difficulty: "EASY",
    tags: ["array","binary-search"],
    samples: [{"nums":[0,1,0]},{"nums":[0,2,1,0]}],
    hiddens: [{"nums":[0,10,5,2]},{"nums":[3,4,5,1]},{"nums":[1,3,2]},{"nums":[0,1,2,3,2,1,0]}],
    solve: (input) => {
    const nums = input.nums
    let lo = 0
    let hi = nums.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (nums[mid] < nums[mid + 1]) lo = mid + 1
      else hi = mid
    }
    return lo
  },
  },
  {
    seedKey: "shard-kth-largest",
    title: "Shard Kth Largest",
    story:
      "Everyone in a game got a score. The game wants to know who came in **k-th place**.\n\n1st place is the biggest score, 2nd place is the next biggest, and so on. If two players have the same score, they still take up two places.",
    params: [
      { name: "nums", type: "number[]", about: "all the scores, in any order." },
      { name: "k", type: "number", about: "which place you want: 1 means the biggest score." },
    ],
    returns: { type: "number", about: "the score in `k`-th place when scores are sorted from biggest to smallest." },
    rules: ["`k` is always between 1 and the number of scores.", "Repeated scores each take their own place."],
    examples: [
      { input: { nums: [3, 2, 1, 5, 6, 4], k: 2 }, why: "From biggest to smallest: 6, 5, 4, 3, 2, 1. 2nd place is 5." },
      { input: { nums: [2, 2, 2], k: 2 }, why: "All three scores are 2, so 2nd place is also 2." },
      { input: { nums: [9, 1, 8, 2], k: 4 }, why: "Sorted: 9, 8, 2, 1. 4th place is the last one, 1." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","heap","sorting"],
    samples: [{"nums":[3,2,1,5,6,4],"k":2},{"nums":[1],"k":1}],
    hiddens: [{"nums":[7,6,5,4,3,2,1],"k":3},{"nums":[2,2,2],"k":2},{"nums":[-1,-2,-3],"k":1},{"nums":[9,1,8,2],"k":4}],
    solve: (input) => {
    const sorted = [...input.nums].sort((a, b) => b - a)
    return sorted[input.k - 1]
  },
  },
  {
    seedKey: "flux-container-water",
    title: "Flux Container Water",
    story:
      "There is a row of fence posts with different heights, one step apart.\n\nPick **two posts**. Pretend you stretch a sheet between them to make a tank. Water fills up only as high as the **shorter** post, or it spills over.\n\nThe water held is: shorter height x distance between the posts. Find the most water you can hold.",
    params: [{ name: "h", type: "number[]", about: "the height of each post, from left to right. Posts are 1 step apart." }],
    returns: { type: "number", about: "the biggest amount of water two posts can hold." },
    rules: ["You must pick two different posts.", "With fewer than two posts you cannot make a tank, so return `0`."],
    examples: [
      { input: { h: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, why: "Pick the post of height 8 (step 1) and height 7 (step 8). The shorter is 7 and they are 7 steps apart: 7 x 7 = 49." },
      { input: { h: [1, 1] }, why: "Both posts are height 1 and 1 step apart: 1 x 1 = 1." },
      { input: { h: [5] }, why: "Only one post, so no tank: 0." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","two-pointers"],
    samples: [{"h":[1,8,6,2,5,4,8,3,7]},{"h":[1,1]}],
    hiddens: [{"h":[4,3,2,1,4]},{"h":[1,2,1]},{"h":[2,3,4,5,18,17,6]},{"h":[5]}],
    solve: (input) => {
    const h = input.h
    let l = 0
    let r = h.length - 1
    let best = 0
    while (l < r) {
      best = Math.max(best, Math.min(h[l], h[r]) * (r - l))
      if (h[l] < h[r]) l++
      else r--
    }
    return best
  },
  },
  {
    seedKey: "orbit-next-permutation",
    title: "Orbit Next Permutation",
    story:
      "Imagine writing every way to arrange some number cards, in dictionary order (like words in a dictionary, but with numbers). Each arrangement is called a **permutation**.\n\nFor 1, 2, 3 the list goes: 123, 132, 213, 231, 312, 321.\n\nGiven one arrangement, find the **next one** in that list. If it is already the last one, wrap around to the very first (smallest) one.",
    params: [{ name: "nums", type: "number[]", about: "the current arrangement of cards." }],
    returns: { type: "number[]", about: "the next arrangement in dictionary order, or the smallest arrangement if there is no next one." },
    rules: ["Cards may repeat.", "Hint: from the right, find the first card that is smaller than the card after it."],
    examples: [
      { input: { nums: [1, 2, 3] }, why: "In the list, 123 is followed by 132." },
      { input: { nums: [1, 3, 2] }, why: "In the list, 132 is followed by 213." },
      { input: { nums: [3, 2, 1] }, why: "321 is the last arrangement, so wrap around to the first one: 123." },
    ],
    difficulty: "HARD",
    tags: ["array","two-pointers"],
    samples: [{"nums":[1,2,3]},{"nums":[3,2,1]}],
    hiddens: [{"nums":[1,1,5]},{"nums":[1]},{"nums":[1,3,2]},{"nums":[2,1,3]}],
    solve: (input) => {
    const nums = [...input.nums]
    let i = nums.length - 2
    while (i >= 0 && nums[i] >= nums[i + 1]) i--
    if (i >= 0) {
      let j = nums.length - 1
      while (nums[j] <= nums[i]) j--
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
    let l = i + 1
    let r = nums.length - 1
    while (l < r) {
      ;[nums[l], nums[r]] = [nums[r], nums[l]]
      l++
      r--
    }
    return nums
  },
  },
  {
    seedKey: "delta-first-missing-positive",
    title: "Delta First Missing Positive",
    story:
      "A raffle hands out tickets numbered 1, 2, 3, and so on. Some tickets got lost, and some weird tickets (zero or negative numbers) got mixed in.\n\nWhat is the **smallest positive ticket number** (1 or more) that is not in the pile?",
    params: [{ name: "nums", type: "number[]", about: "the ticket numbers in the pile. They can be in any order, repeated, zero or negative." }],
    returns: { type: "number", about: "the smallest whole number 1 or bigger that is not in the pile." },
    rules: ["Ignore zero and negative numbers; they are never the answer.", "An empty pile is missing ticket `1`."],
    examples: [
      { input: { nums: [1, 2, 0] }, why: "1 and 2 are there, so the first missing one is 3." },
      { input: { nums: [3, 4, -1, 1] }, why: "1 is there but 2 is not, so the answer is 2." },
      { input: { nums: [7, 8, 9] }, why: "Ticket 1 is missing, so the answer is 1." },
    ],
    difficulty: "HARD",
    tags: ["array","hash-set"],
    samples: [{"nums":[1,2,0]},{"nums":[3,4,-1,1]}],
    hiddens: [{"nums":[7,8,9]},{"nums":[1]},{"nums":[]},{"nums":[2,1]}],
    solve: (input) => {
    const set = new Set(input.nums)
    let x = 1
    while (set.has(x)) x++
    return x
  },
  },
]
