import type { CatalogProblemDef } from "../types.js"

// Heap / greedy / sim / misc
export const miscProblems: CatalogProblemDef[] = [
  {
    seedKey: "heap-merge-k-lists",
    title: "Heap Merge K Streams",
    story:
      "Some friends each made a line of trading cards, and every line is already sorted from smallest number to biggest.\n\nNow they want to pour all the lines into one big line that is still sorted from smallest to biggest.\n\nA handy trick is a **heap** (a pile that always keeps the smallest item on top), so you can always grab the smallest front card among all the lines.",
    params: [{ name: "lists", type: "number[][]", about: "the friends' card lines, each one already sorted from smallest to biggest." }],
    returns: { type: "number[]", about: "every card from every line, in one list sorted from smallest to biggest." },
    rules: ["There can be zero lines, and a line can be empty.", "Numbers can repeat; keep every copy."],
    examples: [
      { input: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] }, why: "Taking the smallest front card each time gives 1, 1, 2, 3, 4, 4, 5, 6." },
      { input: { lists: [[1], [0]] }, why: "The cards are 1 and 0, and sorted that is 0, 1." },
      { input: { lists: [] }, why: "There are no lines at all, so the merged line is empty." },
    ],
    difficulty: "HARD",
    tags: ["heap","linked-list","sorting"],
    samples: [{"lists":[[1,4,5],[1,3,4],[2,6]]},{"lists":[]}],
    hiddens: [{"lists":[[]]},{"lists":[[1],[0]]},{"lists":[[1,2,3],[4,5]]},{"lists":[[2],[1],[3],[0]]}],
    solve: (input) => input.lists.flat().sort((a, b) => a - b),
  },
  {
    seedKey: "heap-k-closest-points",
    title: "Heap K Closest Points",
    story:
      "You stand at the middle of a park, at spot (0, 0). Your friends are hiding at different spots on a grid.\n\nYou only have time to find `k` of them, so you pick the `k` friends who are **closest** to you.\n\nTo compare distances you can use x times x plus y times y (the distance squared). A smaller number means closer, and you never need a square root.",
    params: [
      { name: "points", type: "number[][]", about: "each friend's spot as `[x, y]`." },
      { name: "k", type: "number", about: "how many friends you have time to find." },
    ],
    returns: { type: "number[][]", about: "the `k` spots closest to (0, 0)." },
    rules: [
      "List the `k` spots from closest to farthest.",
      "If two spots are equally close, keep the one that came first in `points` ahead of the other.",
      "`k` is at least 1 and at most the number of points.",
    ],
    examples: [
      { input: { points: [[1, 3], [-2, 2]], k: 1 }, why: "(1, 3) has 1 + 9 = 10 and (-2, 2) has 4 + 4 = 8. The smaller one is (-2, 2)." },
      { input: { points: [[3, 3], [5, -1], [-2, 4]], k: 2 }, why: "The squared distances are 18, 26 and 20. The two smallest are 18 and 20, so the spots are (3, 3) and (-2, 4)." },
    ],
    difficulty: "MEDIUM",
    tags: ["heap","sorting","math"],
    samples: [{"points":[[1,3],[-2,2]],"k":1},{"points":[[3,3],[5,-1],[-2,4]],"k":2}],
    hiddens: [{"points":[[0,1]],"k":1},{"points":[[1,0],[0,1],[1,1]],"k":2},{"points":[[2,2],[1,1],[0,0]],"k":3},{"points":[[5,5],[1,1]],"k":1}],
    solve: (input) =>
    [...input.points]
      .sort((a, b) => a[0] * a[0] + a[1] * a[1] - (b[0] * b[0] + b[1] * b[1]))
      .slice(0, input.k),
  },
  {
    seedKey: "greedy-jump-game-ii",
    title: "Greedy Jump Min Steps",
    story:
      "A frog is on the first lily pad in a row of lily pads.\n\nEach pad has a number. It tells the frog the **farthest** it can jump forward from that pad. It can also jump shorter.\n\nThe frog wants to reach the last pad using as **few jumps** as possible. A **greedy** idea (always grab the best choice you can see right now) works great: keep track of the farthest pad you could reach with one more jump.",
    params: [{ name: "nums", type: "number[]", about: "the biggest jump allowed from each lily pad, from first to last." }],
    returns: { type: "number", about: "the smallest number of jumps to land on the last pad." },
    rules: ["The last pad can always be reached.", "If there is only one pad, the frog is already there, so the answer is `0`."],
    examples: [
      { input: { nums: [2, 3, 1, 1, 4] }, why: "Jump 1 pad to the pad with 3, then jump 3 pads to the last pad. That is 2 jumps." },
      { input: { nums: [1, 1, 1, 1] }, why: "Each pad only lets the frog move 1 step, so it needs 3 jumps to go from pad 0 to pad 3." },
      { input: { nums: [1] }, why: "The frog starts on the last pad, so it needs 0 jumps." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","greedy"],
    samples: [{"nums":[2,3,1,1,4]},{"nums":[2,3,0,1,4]}],
    hiddens: [{"nums":[1]},{"nums":[1,1,1,1]},{"nums":[2,1]},{"nums":[1,2,3]}],
    solve: (input) => {
    let jumps = 0
    let end = 0
    let farthest = 0
    for (let i = 0; i < input.nums.length - 1; i++) {
      farthest = Math.max(farthest, i + input.nums[i])
      if (i === end) {
        jumps++
        end = farthest
      }
    }
    return jumps
  },
  },
  {
    seedKey: "greedy-gas-station",
    title: "Greedy Circuit Fuel",
    story:
      "A toy car drives around a circle track with gas stations on it. After the last station, the track loops back to the first one.\n\nAt station `i` the car picks up `gas[i]` fuel. Driving from station `i` to the next station uses `cost[i]` fuel. The tank starts empty.\n\nWhich station should the car start from so it can drive all the way around once without running out of fuel?",
    params: [
      { name: "gas", type: "number[]", about: "how much fuel the car picks up at each station." },
      { name: "cost", type: "number[]", about: "how much fuel it takes to drive from each station to the next one." },
    ],
    returns: { type: "number", about: "the station number (counting from 0) to start at, or `-1` if no start works." },
    rules: [
      "`gas` and `cost` have the same length.",
      "If a working start exists, there is only one.",
      "Return `-1` if the car can never make it all the way around.",
    ],
    examples: [
      { input: { gas: [1, 2, 3, 4, 5], cost: [3, 4, 5, 1, 2] }, why: "Starting at station 3, the tank goes 3, 6, 4, 2, then 0 when it is back home. It never goes below 0, so the answer is 3." },
      { input: { gas: [2, 3, 4], cost: [3, 4, 3] }, why: "All the fuel is 9 but the whole trip costs 10, so no start can work. The answer is -1." },
      { input: { gas: [5], cost: [4] }, why: "With one station, the car gets 5 fuel and needs 4 to loop back, so starting at 0 works." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","greedy"],
    samples: [{"gas":[1,2,3,4,5],"cost":[3,4,5,1,2]},{"gas":[2,3,4],"cost":[3,4,3]}],
    hiddens: [{"gas":[5],"cost":[4]},{"gas":[5],"cost":[6]},{"gas":[1,2],"cost":[2,1]},{"gas":[3,1,1],"cost":[1,2,2]}],
    solve: (input) => {
    let total = 0
    let tank = 0
    let start = 0
    for (let i = 0; i < input.gas.length; i++) {
      const diff = input.gas[i] - input.cost[i]
      total += diff
      tank += diff
      if (tank < 0) {
        start = i + 1
        tank = 0
      }
    }
    return total >= 0 ? start : -1
  },
  },
  {
    seedKey: "greedy-assign-cookies",
    title: "Greedy Cookie Assign",
    story:
      "You have a plate of cookies and a group of hungry kids.\n\nEach kid has a **greed** number: the smallest cookie size that makes them happy. A kid is happy if they get one cookie that is at least that big.\n\nEach kid can get at most one cookie, and each cookie can go to only one kid. How many kids can you make happy?",
    params: [
      { name: "g", type: "number[]", about: "the greed number of each kid." },
      { name: "s", type: "number[]", about: "the size of each cookie." },
    ],
    returns: { type: "number", about: "the most kids you can make happy." },
    rules: ["A kid is happy only if their cookie size is greater than or equal to their greed.", "Either list can be empty."],
    examples: [
      { input: { g: [1, 2, 3], s: [1, 1] }, why: "Both cookies have size 1, so only the kid with greed 1 can be made happy. The answer is 1." },
      { input: { g: [1, 2], s: [1, 2, 3] }, why: "Give size 1 to the greed-1 kid and size 2 to the greed-2 kid. Both are happy, so the answer is 2." },
      { input: { g: [1], s: [] }, why: "There are no cookies, so nobody can be happy. The answer is 0." },
    ],
    difficulty: "EASY",
    tags: ["greedy","sorting","two-pointers"],
    samples: [{"g":[1,2,3],"s":[1,1]},{"g":[1,2],"s":[1,2,3]}],
    hiddens: [{"g":[],"s":[1]},{"g":[1],"s":[]},{"g":[10,9,8],"s":[5,6,7]},{"g":[1,2,3],"s":[3]}],
    solve: (input) => {
    const g = [...input.g].sort((a, b) => a - b)
    const s = [...input.s].sort((a, b) => a - b)
    let i = 0
    let j = 0
    while (i < g.length && j < s.length) {
      if (s[j] >= g[i]) i++
      j++
    }
    return i
  },
  },
  {
    seedKey: "sim-robot-bounded",
    title: "Sim Robot Bound Loop",
    story:
      "A little robot starts at spot (0, 0) on a giant floor, facing north (up).\n\nIt reads a list of letters. `G` means go forward one step. `L` means turn left 90 degrees. `R` means turn right 90 degrees.\n\nWhen it finishes the list, it starts again from the beginning, forever. Will the robot stay inside some circle, or will it wander off forever?",
    params: [{ name: "instructions", type: "string", about: "the letters the robot repeats, using only `G`, `L` and `R`." }],
    returns: { type: "boolean", about: "`true` if the robot stays inside some circle forever, otherwise `false`." },
    rules: [
      "After one pass, if the robot is back at (0, 0) or is no longer facing north, it will stay inside a circle.",
      "An empty list means the robot never moves, so it stays put (`true`).",
    ],
    examples: [
      { input: { instructions: "GGLLGG" }, why: "The robot walks 2 steps up, turns around, and walks 2 steps back to (0, 0). It loops in place, so the answer is true." },
      { input: { instructions: "GG" }, why: "Each pass moves it 2 more steps north and it still faces north, so it walks away forever. The answer is false." },
      { input: { instructions: "GL" }, why: "After one pass it faces west instead of north. After 4 passes it comes back home, so the answer is true." },
    ],
    difficulty: "MEDIUM",
    tags: ["simulation","math"],
    samples: [{"instructions":"GGLLGG"},{"instructions":"GG"}],
    hiddens: [{"instructions":"GL"},{"instructions":""},{"instructions":"GGLGLG"},{"instructions":"LL"}],
    solve: (input) => {
    let x = 0
    let y = 0
    let dir = 0
    const dirs = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]
    for (const c of input.instructions) {
      if (c === "L") dir = (dir + 3) % 4
      else if (c === "R") dir = (dir + 1) % 4
      else {
        x += dirs[dir][0]
        y += dirs[dir][1]
      }
    }
    return (x === 0 && y === 0) || dir !== 0
  },
  },
  {
    seedKey: "sim-spiral-matrix-ii",
    title: "Sim Spiral Fill Matrix",
    story:
      "You have a square sticker sheet with `n` rows and `n` columns. This grid is called a **matrix** (a table of numbers in rows and columns).\n\nStart at the top-left box and write 1. Keep going right, then down, then left, then up, curling inward like a snail shell. Write the next number in each new box.\n\nKeep going until every box has a number, ending with n x n.",
    params: [{ name: "n", type: "number", about: "how many rows and columns the square sheet has." }],
    returns: { type: "number[][]", about: "the filled grid, as a list of rows from top to bottom." },
    rules: ["If `n` is 0, there are no boxes, so return an empty list `[]`."],
    examples: [
      { input: { n: 3 }, why: "Go right with 1, 2, 3, down with 4, 5, left with 6, 7, up with 8, then 9 lands in the middle." },
      { input: { n: 1 }, why: "There is only one box, so it gets the number 1." },
      { input: { n: 0 }, why: "There are no boxes, so the grid is empty." },
    ],
    difficulty: "MEDIUM",
    tags: ["matrix","simulation"],
    samples: [{"n":3},{"n":1}],
    hiddens: [{"n":2},{"n":4},{"n":5},{"n":0}],
    solve: (input) => {
    const n = input.n
    const mat = Array.from({ length: n }, () => Array(n).fill(0))
    let top = 0
    let bottom = n - 1
    let left = 0
    let right = n - 1
    let v = 1
    while (top <= bottom && left <= right) {
      for (let j = left; j <= right; j++) mat[top][j] = v++
      top++
      for (let i = top; i <= bottom; i++) mat[i][right] = v++
      right--
      if (top <= bottom) {
        for (let j = right; j >= left; j--) mat[bottom][j] = v++
        bottom--
      }
      if (left <= right) {
        for (let i = bottom; i >= top; i--) mat[i][left] = v++
        left++
      }
    }
    return mat
  },
  },
  {
    seedKey: "sort-custom-sort-string",
    title: "Sort Custom Order Key",
    story:
      "Aliens have their own alphabet order! The string `order` lists their letters from first to last.\n\nYou are given a word `s`. Rearrange its letters so they follow the alien order.\n\nLetters the aliens never listed do not have a spot, so they go at the very end.",
    params: [
      { name: "order", type: "string", about: "the alien letters from first to last, with no letter repeated." },
      { name: "s", type: "string", about: "the word whose letters you rearrange." },
    ],
    returns: { type: "string", about: "the letters of `s` arranged in the alien order." },
    rules: [
      "Letters not in `order` go after all the listed letters, and keep the same order they had in `s`.",
      "Repeated letters stay next to each other.",
      "An empty `s` gives an empty string.",
    ],
    examples: [
      { input: { order: "cba", s: "abcd" }, why: "The alien order is c, then b, then a, so we get \"cba\". The letter d is not listed, so it goes last: \"cbad\"." },
      { input: { order: "kqep", s: "pekeq" }, why: "Put k first, then q, then both e's, then p: \"kqeep\"." },
      { input: { order: "zyx", s: "" }, why: "There are no letters to sort, so the answer is an empty string." },
    ],
    difficulty: "EASY",
    tags: ["string","sorting","hash-map"],
    samples: [{"order":"cba","s":"abcd"},{"order":"cbafg","s":"abcd"}],
    hiddens: [{"order":"kqep","s":"pekeq"},{"order":"a","s":"a"},{"order":"zyx","s":""},{"order":"abc","s":"ccba"}],
    solve: (input) => {
    const rank = {}
    for (let i = 0; i < input.order.length; i++) rank[input.order[i]] = i
    return [...input.s]
      .sort((a, b) => {
        const ra = rank[a] ?? 1000
        const rb = rank[b] ?? 1000
        return ra - rb
      })
      .join("")
  },
  },
  {
    seedKey: "prefix-range-sum-query",
    title: "Prefix Range Sum Query",
    story:
      "A row of piggy banks sits on a shelf. Each one has some coins (a negative number means it owes coins).\n\nYour friends keep asking: \"How many coins are in the banks from spot `i` to spot `j`, together?\"\n\nA neat trick is a **prefix sum** (a running total from the start of the shelf). Then any range total is one subtraction.",
    params: [
      { name: "nums", type: "number[]", about: "the coins in each piggy bank, from left to right." },
      { name: "queries", type: "number[][]", about: "the questions, each written as `[i, j]`." },
    ],
    returns: { type: "number[]", about: "the total for each question, in the same order as `queries`." },
    rules: [
      "Spots are counted from 0.",
      "Each question `[i, j]` includes both spot `i` and spot `j`, and `i <= j`.",
      "If there are no questions, return an empty list.",
    ],
    examples: [
      { input: { nums: [-2, 0, 3, -5, 2, -1], queries: [[0, 2], [2, 5], [0, 5]] }, why: "Spots 0 to 2: -2 + 0 + 3 = 1. Spots 2 to 5: 3 - 5 + 2 - 1 = -1. All spots: -3." },
      { input: { nums: [5], queries: [[0, 0]] }, why: "The only question asks about spot 0 alone, which holds 5." },
      { input: { nums: [], queries: [] }, why: "No questions means an empty list of answers." },
    ],
    difficulty: "EASY",
    tags: ["array","prefix-sum"],
    samples: [{"nums":[-2,0,3,-5,2,-1],"queries":[[0,2],[2,5],[0,5]]},{"nums":[1,2,3],"queries":[[0,0]]}],
    hiddens: [{"nums":[],"queries":[]},{"nums":[5],"queries":[[0,0]]},{"nums":[1,-1,1],"queries":[[0,1],[1,2]]},{"nums":[10,20,30],"queries":[[0,2]]}],
    solve: (input) => {
    const pref = [0]
    for (const x of input.nums) pref.push(pref[pref.length - 1] + x)
    return input.queries.map(([i, j]) => pref[j + 1] - pref[i])
  },
  },
  {
    seedKey: "prefix-product-except-self-sign",
    title: "Prefix Sign Product Mask",
    story:
      "A row of robots each holds a number card.\n\nEach robot hides its own card and imagines **multiplying** everyone else's cards together. It does not care how big the answer is, only its **sign**: is it positive, negative, or zero?\n\nTip: you only need to track signs (1, -1 or 0), so the numbers never get huge.",
    params: [{ name: "nums", type: "number[]", about: "the number on each robot's card, from left to right." }],
    returns: { type: "number[]", about: "for each robot, `1` if the product of the other cards is positive, `-1` if negative, or `0` if it is zero." },
    rules: [
      "An empty list gives an empty list back.",
      "A single robot has nobody else. Multiplying nothing gives 1, so its answer is `1`.",
    ],
    examples: [
      { input: { nums: [1, -1, -1, 1] }, why: "Robot 0 sees -1 x -1 x 1 = 1, which is positive. Robot 1 sees 1 x -1 x 1 = -1, which is negative. Doing every robot gives [1, -1, -1, 1]." },
      { input: { nums: [0, 1, 2] }, why: "Robot 0 hides the zero and sees 1 x 2, which is positive. The others still see the zero, so they get 0." },
      { input: { nums: [5] }, why: "There is nobody else to multiply, so the product is 1, which is positive." },
    ],
    difficulty: "EASY",
    tags: ["array","prefix-sum","math"],
    samples: [{"nums":[1,-1,-1,1]},{"nums":[0,1,2]}],
    hiddens: [{"nums":[]},{"nums":[5]},{"nums":[-2,-3,-4]},{"nums":[1,2,3,4]}],
    solve: (input) => {
    const nums = input.nums
    const n = nums.length
    const out = Array(n).fill(1)
    let left = 1
    for (let i = 0; i < n; i++) {
      out[i] = left
      left *= nums[i] === 0 ? 0 : nums[i] > 0 ? 1 : -1
    }
    let right = 1
    for (let i = n - 1; i >= 0; i--) {
      out[i] *= right
      right *= nums[i] === 0 ? 0 : nums[i] > 0 ? 1 : -1
    }
    return out.map((x) => (x === 0 ? 0 : x > 0 ? 1 : -1))
  },
  },
  {
    seedKey: "mono-next-greater",
    title: "Mono Next Greater Element",
    story:
      "Kids stand in a line, each wearing a number shirt (`nums2`). You have a short list of shirt numbers you care about (`nums1`).\n\nFor each number on your list, find that kid in the line. Then look to their right and find the **first** kid wearing a bigger number.\n\nA **stack** (a pile where you only add or remove from the top) helps you find all these answers in one walk down the line.",
    params: [
      { name: "nums1", type: "number[]", about: "the shirt numbers you want answers for." },
      { name: "nums2", type: "number[]", about: "the shirt numbers of the whole line, from left to right." },
    ],
    returns: { type: "number[]", about: "for each number in `nums1`, the first bigger number to its right in `nums2`, or `-1` if there is none." },
    rules: [
      "Every number in `nums1` also appears in `nums2`.",
      "No shirt number appears twice in `nums2`.",
      "Answers are in the same order as `nums1`.",
    ],
    examples: [
      { input: { nums1: [4, 1, 2], nums2: [1, 3, 4, 2] }, why: "Nobody to the right of 4 is bigger, so -1. The first bigger number after 1 is 3. Nothing after 2, so -1." },
      { input: { nums1: [2, 4], nums2: [1, 2, 3, 4] }, why: "Right after 2 comes 3, which is bigger. 4 is last, so it gets -1." },
      { input: { nums1: [], nums2: [1, 2] }, why: "You asked about no numbers, so the answer is an empty list." },
    ],
    difficulty: "EASY",
    tags: ["array","stack","monotonic-stack","hash-map"],
    samples: [{"nums1":[4,1,2],"nums2":[1,3,4,2]},{"nums1":[2,4],"nums2":[1,2,3,4]}],
    hiddens: [{"nums1":[1],"nums2":[1]},{"nums1":[],"nums2":[1,2]},{"nums1":[3,1],"nums2":[3,2,1]},{"nums1":[2,1],"nums2":[2,1,3]}],
    solve: (input) => {
    const next = new Map()
    const st = []
    for (const x of input.nums2) {
      while (st.length && st[st.length - 1] < x) next.set(st.pop(), x)
      st.push(x)
    }
    return input.nums1.map((x) => (next.has(x) ? next.get(x) : -1))
  },
  },
  {
    seedKey: "recursion-powerset-sum",
    title: "Recursion Subset Sum Exists",
    story:
      "You have a bag of coins with different values. A toy costs exactly `target`.\n\nCan you pick some of the coins (maybe all, maybe none) so that they add up to **exactly** the price? Each coin can be used at most once.\n\nPicking some items from a group is called a **subset**. You can try every choice with **recursion** (a function that calls itself): for each coin, either take it or skip it.",
    params: [
      { name: "nums", type: "number[]", about: "the value of each coin in the bag." },
      { name: "target", type: "number", about: "the exact price of the toy." },
    ],
    returns: { type: "boolean", about: "`true` if some coins add up to exactly `target`, otherwise `false`." },
    rules: ["Picking no coins at all adds up to 0, so a `target` of 0 is always `true`.", "Each coin can be used at most once."],
    examples: [
      { input: { nums: [1, 2, 3], target: 5 }, why: "Pick 2 and 3, which add up to 5. So the answer is true." },
      { input: { nums: [1, 2, 3], target: 7 }, why: "Even all the coins only add up to 6, so 7 is impossible. The answer is false." },
      { input: { nums: [], target: 0 }, why: "Picking no coins gives 0, which matches the price. The answer is true." },
    ],
    difficulty: "MEDIUM",
    tags: ["recursion","dynamic-programming","backtracking"],
    samples: [{"nums":[1,2,3],"target":5},{"nums":[1,2,3],"target":7}],
    hiddens: [{"nums":[],"target":0},{"nums":[1],"target":0},{"nums":[2,4,6],"target":9},{"nums":[1,5,11,5],"target":11}],
    solve: (input) => {
    const dp = new Set([0])
    for (const x of input.nums) {
      const next = new Set(dp)
      for (const s of dp) next.add(s + x)
      for (const s of next) dp.add(s)
    }
    return dp.has(input.target)
  },
  },
]
