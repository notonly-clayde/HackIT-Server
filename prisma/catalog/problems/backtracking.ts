import type { CatalogProblemDef } from "../types.js"

// Backtracking
export const backtrackingProblems: CatalogProblemDef[] = [
  {
    seedKey: "backtrack-subsets",
    title: "Backtrack Power Set",
    story:
      "You have a few toppings for your pizza, and each topping has a number.\n\nYou want to see every possible pizza you could make. You can pick any **subset** of the toppings (some of them, maybe none or all). A plain pizza with no toppings counts too!\n\nList every subset. Put the small ones first: the empty one, then all the one-topping pizzas, then the two-topping pizzas, and so on.",
    params: [{ name: "nums", type: "number[]", about: "the topping numbers. No number appears twice." }],
    returns: { type: "number[][]", about: "every subset of `nums`, each written from smallest to biggest number." },
    rules: [
      "All numbers in `nums` are different.",
      "Inside each subset, list the numbers from smallest to biggest.",
      "Order the subsets by size first (empty, then size 1, then size 2, ...).",
      "Subsets of the same size are in dictionary order: compare the first numbers, and if they tie, the next ones.",
      "An empty `nums` still has one subset: the empty one, so return `[[]]`.",
    ],
    examples: [
      { input: { nums: [1, 2, 3] }, why: "First the empty subset, then [1], [2], [3], then the pairs [1,2], [1,3], [2,3], and last all three: [1,2,3]." },
      { input: { nums: [5, 4] }, why: "Sort to 4, 5. Then list the empty subset, [4], [5], and [4,5]." },
      { input: { nums: [] }, why: "With no toppings, the only pizza is the plain one: the empty subset." },
    ],
    difficulty: "MEDIUM",
    tags: ["backtracking","array","bit-manipulation"],
    samples: [{"nums":[1,2,3]},{"nums":[0]}],
    hiddens: [{"nums":[]},{"nums":[1,2]},{"nums":[5,4]},{"nums":[1,2,3,4]}],
    solve: (input) => {
    const nums = [...input.nums].sort((a, b) => a - b)
    const out = []
    const n = nums.length
    for (let mask = 0; mask < 1 << n; mask++) {
      const sub = []
      for (let i = 0; i < n; i++) if (mask & (1 << i)) sub.push(nums[i])
      out.push(sub)
    }
    out.sort((a, b) => a.length - b.length || a.join(",").localeCompare(b.join(",")))
    return out
  },
  },
  {
    seedKey: "backtrack-permutations",
    title: "Backtrack Full Permute",
    story:
      "Some friends are lining up for a photo. Each friend wears a shirt with a number.\n\nThe photographer wants to try every possible line-up. Each line-up is a **permutation** (the same friends, just in a different order). Everyone must be in every photo, exactly once.\n\nList all the line-ups, sorted like words in a dictionary.",
    params: [{ name: "nums", type: "number[]", about: "the shirt numbers of the friends. No number appears twice." }],
    returns: { type: "number[][]", about: "every ordering of `nums`, sorted in dictionary order." },
    rules: [
      "All numbers in `nums` are different.",
      "Sort the line-ups in dictionary order: compare the first numbers, and if they tie, the next ones, and so on.",
      "An empty `nums` has exactly one line-up: the empty one, so return `[[]]`.",
    ],
    examples: [
      { input: { nums: [1, 2, 3] }, why: "Line-ups starting with 1 come first ([1,2,3], [1,3,2]), then those starting with 2, then those starting with 3. That makes 6 in total." },
      { input: { nums: [3, 2, 1] }, why: "The starting order does not matter. The same 6 line-ups come back, sorted from [1,2,3] to [3,2,1]." },
      { input: { nums: [1] }, why: "One friend can only stand one way, so there is one line-up: [1]." },
    ],
    difficulty: "MEDIUM",
    tags: ["backtracking","array"],
    samples: [{"nums":[1,2,3]},{"nums":[0,1]}],
    hiddens: [{"nums":[1]},{"nums":[]},{"nums":[3,2,1]},{"nums":[1,2]}],
    solve: (input) => {
    const nums = [...input.nums]
    const out = []
    const used = Array(nums.length).fill(false)
    const path = []
    const dfs = () => {
      if (path.length === nums.length) {
        out.push([...path])
        return
      }
      for (let i = 0; i < nums.length; i++) {
        if (used[i]) continue
        used[i] = true
        path.push(nums[i])
        dfs()
        path.pop()
        used[i] = false
      }
    }
    dfs()
    return out.sort((a, b) => a.join(",").localeCompare(b.join(",")))
  },
  },
  {
    seedKey: "backtrack-combination-sum",
    title: "Backtrack Combo Sum",
    story:
      "A shop sells stickers at a few different prices. You have exactly `target` coins and you want to spend every single one.\n\nYou can buy the same kind of sticker as many times as you like. Find every different way to spend exactly `target` coins.\n\nBuying 2 then 3 is the same as buying 3 then 2, so count that way only once. Each way is a **combination** (a group of picks where the order does not matter).",
    params: [
      { name: "candidates", type: "number[]", about: "the sticker prices. Every price is positive and different." },
      { name: "target", type: "number", about: "how many coins you must spend exactly." },
    ],
    returns: { type: "number[][]", about: "every combination of prices that adds up to `target`." },
    rules: [
      "All prices are positive and different.",
      "You may use the same price more than once.",
      "Write each combination from smallest to biggest price.",
      "Sort the list of combinations in dictionary order: compare the first prices, and if they tie, the next ones.",
      "If there is no way to spend exactly `target`, return an empty list `[]`.",
    ],
    examples: [
      { input: { candidates: [2, 3, 6, 7], target: 7 }, why: "2 + 2 + 3 = 7, and 7 alone is 7. No other mix works, and [2,2,3] comes before [7]." },
      { input: { candidates: [2, 3, 5], target: 8 }, why: "The ways are 2+2+2+2, 2+3+3 and 3+5, listed in dictionary order." },
      { input: { candidates: [2], target: 1 }, why: "The only price is 2, which is already more than 1 coin, so there is no way and the answer is empty." },
    ],
    difficulty: "MEDIUM",
    tags: ["backtracking","array"],
    samples: [{"candidates":[2,3,6,7],"target":7},{"candidates":[2,3,5],"target":8}],
    hiddens: [{"candidates":[2],"target":1},{"candidates":[1],"target":1},{"candidates":[2,3],"target":5},{"candidates":[8,7,4,3],"target":11}],
    solve: (input) => {
    const cand = [...input.candidates].sort((a, b) => a - b)
    const out = []
    const path = []
    const dfs = (start, remain) => {
      if (remain === 0) {
        out.push([...path])
        return
      }
      for (let i = start; i < cand.length; i++) {
        if (cand[i] > remain) break
        path.push(cand[i])
        dfs(i, remain - cand[i])
        path.pop()
      }
    }
    dfs(0, input.target)
    return out
  },
  },
  {
    seedKey: "backtrack-n-queens-count",
    title: "Backtrack N-Queens Count",
    story:
      "In chess, a **queen** can attack any square in her row, her column, or along either diagonal, as far as she likes.\n\nYou have a square board with `n` rows and `n` columns, and `n` queens. Your puzzle: place all `n` queens so that **no two queens can attack each other**.\n\nHow many different ways can you do it?",
    params: [{ name: "n", type: "number", about: "the size of the board and the number of queens to place." }],
    returns: { type: "number", about: "how many different safe placements of the `n` queens exist." },
    rules: [
      "Two placements are different if at least one queen is on a different square.",
      "Mirror images and rotations count as different placements.",
      "If it is impossible, return `0`.",
    ],
    examples: [
      { input: { n: 4 }, why: "On a 4 by 4 board there are exactly 2 ways to place 4 queens safely (one is the mirror image of the other)." },
      { input: { n: 1 }, why: "One queen on a 1 by 1 board has nobody to attack, so there is 1 way." },
      { input: { n: 3 }, why: "On a 3 by 3 board the queens always end up attacking each other, so there are 0 ways." },
    ],
    difficulty: "HARD",
    tags: ["backtracking","bit-manipulation"],
    samples: [{"n":4},{"n":1}],
    hiddens: [{"n":2},{"n":3},{"n":5},{"n":8}],
    solve: (input) => {
    const n = input.n
    let count = 0
    const cols = new Set()
    const d1 = new Set()
    const d2 = new Set()
    const dfs = (r) => {
      if (r === n) {
        count++
        return
      }
      for (let c = 0; c < n; c++) {
        if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue
        cols.add(c)
        d1.add(r - c)
        d2.add(r + c)
        dfs(r + 1)
        cols.delete(c)
        d1.delete(r - c)
        d2.delete(r + c)
      }
    }
    dfs(0)
    return count
  },
  },
  {
    seedKey: "backtrack-generate-parens",
    title: "Backtrack Paren Forge",
    story:
      "Think of `(` as opening a box and `)` as closing a box. You have `n` boxes, so you must write `n` opens and `n` closes.\n\nA string is **well-formed** when every close matches an open that came before it. So `(())` and `()()` are fine, but `)(` is not, because you cannot close a box you never opened.\n\nWrite down every well-formed string you can make with `n` pairs.",
    params: [{ name: "n", type: "number", about: "how many pairs of parentheses to use." }],
    returns: { type: "string[]", about: "every well-formed string with `n` pairs, sorted in dictionary order." },
    rules: [
      "Sort the strings in dictionary order, where `(` comes before `)`.",
      "When `n` is `0`, the only string is the empty string, so return `[\"\"]`.",
    ],
    examples: [
      { input: { n: 3 }, why: "There are 5 ways. Strings with more opens at the start come first, so \"((()))\" is first and \"()()()\" is last." },
      { input: { n: 2 }, why: "With 2 pairs you can nest them, \"(())\", or put them side by side, \"()()\"." },
      { input: { n: 0 }, why: "With no pairs, the only string is the empty one." },
    ],
    difficulty: "MEDIUM",
    tags: ["backtracking","string"],
    samples: [{"n":3},{"n":1}],
    hiddens: [{"n":2},{"n":4},{"n":0},{"n":5}],
    solve: (input) => {
    const out = []
    const dfs = (s, open, close) => {
      if (s.length === 2 * input.n) {
        out.push(s)
        return
      }
      if (open < input.n) dfs(s + "(", open + 1, close)
      if (close < open) dfs(s + ")", open, close + 1)
    }
    dfs("", 0, 0)
    return out.sort()
  },
  },
]
