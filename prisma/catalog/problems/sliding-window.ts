import type { CatalogProblemDef } from "../types.js"

// Sliding window / two pointers
export const slidingWindowProblems: CatalogProblemDef[] = [
  {
    seedKey: "window-max-avg-sub",
    title: "Window Max Average Slice",
    story:
      "A long train goes past, and each car carries some points (some can even be negative).\n\nYou look through a **window** (a group of neighbors you look at together) that always shows exactly `k` cars in a row. As the train moves, the window slides one car at a time.\n\nWhich window has the best **average** (the total divided by `k`)? Tell the average of that best window.",
    params: [
      { name: "nums", type: "number[]", about: "the points on each train car, from front to back." },
      { name: "k", type: "number", about: "how many cars in a row the window shows." },
    ],
    returns: { type: "number", about: "the biggest average of any `k` cars in a row." },
    rules: [
      "The cars in the window must be next to each other (no skipping).",
      "`k` is at least `1` and never more than the number of cars.",
      "The answer can have a decimal part, like `12.75`.",
    ],
    examples: [
      { input: { nums: [1, 12, -5, -6, 50, 3], k: 4 }, why: "The windows add up to 2, 51 and 42. The best is 12 + -5 + -6 + 50 = 51, and 51 / 4 = 12.75." },
      { input: { nums: [-1, -2, -3], k: 2 }, why: "The windows add up to -3 and -5. The best is -3, and -3 / 2 = -1.5." },
      { input: { nums: [5], k: 1 }, why: "There is only one car, so the average is just 5." },
    ],
    difficulty: "EASY",
    tags: ["array","sliding-window"],
    samples: [{"nums":[1,12,-5,-6,50,3],"k":4},{"nums":[5],"k":1}],
    hiddens: [{"nums":[0,1,1,3,3],"k":4},{"nums":[1,2,3],"k":3},{"nums":[-1,-2,-3],"k":2},{"nums":[9,8,7,6],"k":1}],
    solve: (input) => {
    let sum = 0
    for (let i = 0; i < input.k; i++) sum += input.nums[i]
    let best = sum
    for (let i = input.k; i < input.nums.length; i++) {
      sum += input.nums[i] - input.nums[i - input.k]
      best = Math.max(best, sum)
    }
    return best / input.k
  },
  },
  {
    seedKey: "window-longest-ones-flip",
    title: "Window Longest Ones Flip",
    story:
      "A row of light bulbs hangs on a string. Each bulb is either on (`1`) or off (`0`).\n\nYou have `k` new bulbs, so you can turn on at most `k` of the off bulbs. You want the **longest run** of bulbs that are all on, side by side.\n\nHow long can that run be if you choose your `k` bulbs wisely?",
    params: [
      { name: "nums", type: "number[]", about: "the bulbs from left to right: `1` means on, `0` means off." },
      { name: "k", type: "number", about: "the most off bulbs you are allowed to turn on." },
    ],
    returns: { type: "number", about: "the length of the longest run of on bulbs you can make." },
    rules: [
      "Every value in `nums` is `0` or `1`.",
      "You may turn on fewer than `k` bulbs, or none.",
      "An empty string of bulbs gives `0`.",
    ],
    examples: [
      { input: { nums: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k: 2 }, why: "Turn on the last two bulbs of the 0,0,0 group. They join the four 1s after them, making a run of 2 + 4 = 6." },
      { input: { nums: [0, 0, 0], k: 2 }, why: "Turn on any two neighboring bulbs to get a run of 2." },
      { input: { nums: [], k: 1 }, why: "There are no bulbs at all, so the longest run is 0." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","sliding-window"],
    samples: [{"nums":[1,1,1,0,0,0,1,1,1,1,0],"k":2},{"nums":[0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1],"k":3}],
    hiddens: [{"nums":[],"k":1},{"nums":[0,0,0],"k":2},{"nums":[1,1,1],"k":0},{"nums":[1,0,1,0,1],"k":1}],
    solve: (input) => {
    let l = 0
    let zeros = 0
    let best = 0
    for (let r = 0; r < input.nums.length; r++) {
      if (input.nums[r] === 0) zeros++
      while (zeros > input.k) {
        if (input.nums[l] === 0) zeros--
        l++
      }
      best = Math.max(best, r - l + 1)
    }
    return best
  },
  },
  {
    seedKey: "twopointer-three-sum-zero",
    title: "Twin Pointer Triple Zero",
    story:
      "You have a bag of number cards. Some numbers are positive, some are negative, and some might be zero.\n\nPick **three cards** whose numbers add up to exactly 0, like -1, 0 and 1. Find every different group of three that works.\n\nA group is called a **triplet**. If two triplets have the same three numbers, they count as one, even if they use different cards.",
    params: [{ name: "nums", type: "number[]", about: "the numbers on the cards. Numbers can repeat." }],
    returns: { type: "number[][]", about: "every different triplet that adds up to 0." },
    rules: [
      "Each triplet uses three different cards (different positions), but the numbers on them may be equal.",
      "Do not list the same triplet of numbers twice.",
      "Write each triplet from smallest to biggest.",
      "Order the triplets by their first number, then by their second number, from smallest to biggest.",
      "If no triplet works, return an empty list `[]`.",
    ],
    examples: [
      { input: { nums: [-1, 0, 1, 2, -1, -4] }, why: "-1 + -1 + 2 = 0 and -1 + 0 + 1 = 0. The second -1 makes the same -1,0,1 triplet again, so it is listed once." },
      { input: { nums: [0, 0, 0] }, why: "Three zeros add up to 0, so the only triplet is [0,0,0]." },
      { input: { nums: [0, 1, 1] }, why: "The only three cards add up to 2, not 0, so the answer is empty." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","two-pointers","sorting"],
    samples: [{"nums":[-1,0,1,2,-1,-4]},{"nums":[0,1,1]}],
    hiddens: [{"nums":[]},{"nums":[0,0,0]},{"nums":[-2,0,1,1,2]},{"nums":[1,2,3]}],
    solve: (input) => {
    const nums = [...input.nums].sort((a, b) => a - b)
    const out = []
    for (let i = 0; i < nums.length; i++) {
      if (i && nums[i] === nums[i - 1]) continue
      let l = i + 1
      let r = nums.length - 1
      while (l < r) {
        const sum = nums[i] + nums[l] + nums[r]
        if (sum === 0) {
          out.push([nums[i], nums[l], nums[r]])
          while (l < r && nums[l] === nums[l + 1]) l++
          while (l < r && nums[r] === nums[r - 1]) r--
          l++
          r--
        } else if (sum < 0) l++
        else r--
      }
    }
    return out
  },
  },
  {
    seedKey: "twopointer-container-trap",
    title: "Twin Pointer Rain Trap",
    story:
      "You build a row of towers out of blocks, each tower one block wide. Some towers are tall, some short, and some have zero blocks.\n\nThen it rains. Water gets stuck in the dips between taller towers, but it spills off the ends of the row.\n\nAbove each spot, the water can only rise as high as the **shorter** of the tallest tower on its left and the tallest tower on its right. How many squares of water get trapped in total?",
    params: [{ name: "height", type: "number[]", about: "how many blocks tall each tower is, from left to right." }],
    returns: { type: "number", about: "the total number of water squares trapped after the rain." },
    rules: [
      "Every height is a whole number, `0` or bigger.",
      "Water spills off both ends, so nothing is trapped past the first or last tower.",
      "Fewer than three towers can never trap water, and an empty row gives `0`.",
    ],
    examples: [
      { input: { height: [4, 2, 0, 3, 2, 5] }, why: "The water levels above the middle spots are 4, 4, 4, 4 (the shorter side is the 4 on the left). Subtract the towers 2, 0, 3, 2 to get 2 + 4 + 1 + 2 = 9." },
      { input: { height: [5, 4, 1, 2] }, why: "Only the 1 sits between taller towers (4 on its left, 2 on its right). The water rises to 2, so 1 square is trapped." },
      { input: { height: [1, 2] }, why: "There is no dip between two towers, so no water is trapped." },
    ],
    difficulty: "HARD",
    tags: ["array","two-pointers","stack"],
    samples: [{"height":[0,1,0,2,1,0,1,3,2,1,2,1]},{"height":[4,2,0,3,2,5]}],
    hiddens: [{"height":[]},{"height":[1]},{"height":[1,2]},{"height":[5,4,1,2]}],
    solve: (input) => {
    const h = input.height
    let l = 0
    let r = h.length - 1
    let leftMax = 0
    let rightMax = 0
    let water = 0
    while (l < r) {
      if (h[l] < h[r]) {
        if (h[l] >= leftMax) leftMax = h[l]
        else water += leftMax - h[l]
        l++
      } else {
        if (h[r] >= rightMax) rightMax = h[r]
        else water += rightMax - h[r]
        r--
      }
    }
    return water
  },
  },
  {
    seedKey: "window-fruit-baskets",
    title: "Window Dual Fruit Baskets",
    story:
      "You walk along a row of fruit trees. Each tree grows one type of fruit, shown by a number.\n\nYou carry **two baskets**, and each basket can only hold one type of fruit. You pick one fruit from every tree as you walk, starting at any tree you like, and you must stop as soon as you reach a tree whose fruit fits neither basket.\n\nIn other words, find the longest stretch of trees in a row that has at most 2 fruit types. How many fruits can you pick?",
    params: [{ name: "fruits", type: "number[]", about: "the fruit type of each tree, from left to right." }],
    returns: { type: "number", about: "the most fruits you can pick from trees next to each other using at most 2 types." },
    rules: [
      "The trees you pick from must be next to each other, with no skipping.",
      "You pick exactly one fruit per tree.",
      "An empty row of trees gives `0`.",
    ],
    examples: [
      { input: { fruits: [1, 2, 3, 2, 2] }, why: "Start at the second tree: 2, 3, 2, 2 has only types 2 and 3, so you pick 4 fruits." },
      { input: { fruits: [0, 1, 2, 2] }, why: "The stretch 1, 2, 2 has two types and 3 trees. Adding the 0 would make three types." },
      { input: { fruits: [] }, why: "There are no trees, so you pick 0 fruits." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","sliding-window","hash-map"],
    samples: [{"fruits":[1,2,1]},{"fruits":[0,1,2,2]}],
    hiddens: [{"fruits":[]},{"fruits":[1,2,3,2,2]},{"fruits":[3,3,3]},{"fruits":[1,2,1,2,3]}],
    solve: (input) => {
    const cnt = new Map()
    let l = 0
    let best = 0
    for (let r = 0; r < input.fruits.length; r++) {
      cnt.set(input.fruits[r], (cnt.get(input.fruits[r]) || 0) + 1)
      while (cnt.size > 2) {
        const f = input.fruits[l]
        cnt.set(f, cnt.get(f) - 1)
        if (cnt.get(f) === 0) cnt.delete(f)
        l++
      }
      best = Math.max(best, r - l + 1)
    }
    return best
  },
  },
]
