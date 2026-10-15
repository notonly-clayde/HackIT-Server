import type { CatalogProblemDef } from "../types.js"

// Dynamic programming
export const dynamicProgrammingProblems: CatalogProblemDef[] = [
  {
    seedKey: "dp-climb-stairs",
    title: "DP Stair Pulse Count",
    story:
      "You are at the bottom of a staircase with `n` stairs.\n\nWith each move you can climb **1 stair** or **2 stairs**. You want to reach the very top.\n\nHow many different ways can you do it? Two ways are different if the list of moves is different, so 1 then 2 is not the same as 2 then 1.",
    params: [{ name: "n", type: "number", about: "how many stairs there are." }],
    returns: { type: "number", about: "the number of different ways to reach the top stair." },
    rules: ["Each move is either 1 stair or 2 stairs.", "`n` is at least 1."],
    examples: [
      { input: { n: 3 }, why: "The ways are 1+1+1, 1+2 and 2+1, so there are 3 ways." },
      { input: { n: 4 }, why: "The ways are 1+1+1+1, 1+1+2, 1+2+1, 2+1+1 and 2+2, so there are 5 ways." },
      { input: { n: 1 }, why: "With one stair the only way is a single 1-stair move, so the answer is 1." },
    ],
    difficulty: "EASY",
    tags: ["dynamic-programming","math"],
    samples: [{"n":2},{"n":3}],
    hiddens: [{"n":1},{"n":4},{"n":5},{"n":10}],
    solve: (input) => {
    if (input.n <= 2) return input.n
    let a = 1
    let b = 2
    for (let i = 3; i <= input.n; i++) {
      const c = a + b
      a = b
      b = c
    }
    return b
  },
  },
  {
    seedKey: "dp-house-robber",
    title: "DP Night Circuit Rob",
    story:
      "A sneaky raccoon walks down a street of houses at night. Each house has some coins inside.\n\nBut there is a catch: if the raccoon takes coins from two houses that are **next to each other**, an alarm goes off!\n\nYou get the coins as an **array** (a list of numbers in order). Help the raccoon pick houses so it collects the most coins without ever picking two neighbors.",
    params: [{ name: "nums", type: "number[]", about: "how many coins are in each house, from the first house to the last." }],
    returns: { type: "number", about: "the most coins the raccoon can collect without taking from two neighboring houses." },
    rules: ["You may never take from two houses that are next to each other.", "An empty street gives `0` coins.", "You do not have to take from any house at all."],
    examples: [
      { input: { nums: [2, 7, 9, 3, 1] }, why: "Take houses with 2, 9 and 1. None of them are neighbors, and 2 + 9 + 1 = 12 is the most possible." },
      { input: { nums: [2, 1] }, why: "The two houses are neighbors, so take only one. The bigger one has 2 coins." },
      { input: { nums: [] }, why: "There are no houses, so the raccoon gets 0 coins." },
    ],
    difficulty: "MEDIUM",
    tags: ["dynamic-programming","array"],
    samples: [{"nums":[1,2,3,1]},{"nums":[2,7,9,3,1]}],
    hiddens: [{"nums":[]},{"nums":[5]},{"nums":[2,1]},{"nums":[1,3,1,3,100]}],
    solve: (input) => {
    let prev = 0
    let curr = 0
    for (const x of input.nums) {
      const next = Math.max(curr, prev + x)
      prev = curr
      curr = next
    }
    return curr
  },
  },
  {
    seedKey: "dp-coin-change-min",
    title: "DP Coin Min Count",
    story:
      "You are at a shop and need to pay exactly `amount` cents.\n\nYour piggy bank has coins of a few kinds, listed in `coins`. You have as many of each kind as you want.\n\nYou are lazy and want to hand over as **few coins** as possible. What is the smallest number of coins that adds up to exactly `amount`?",
    params: [
      { name: "coins", type: "number[]", about: "the value of each kind of coin you have." },
      { name: "amount", type: "number", about: "the exact total you need to pay." },
    ],
    returns: { type: "number", about: "the fewest coins that add up to exactly `amount`, or `-1` if it cannot be done." },
    rules: ["You can use each kind of coin as many times as you like.", "If no mix of coins adds up to exactly `amount`, return `-1`.", "Paying `0` needs `0` coins."],
    examples: [
      { input: { coins: [1, 2, 5], amount: 11 }, why: "5 + 5 + 1 = 11 uses 3 coins, and no way uses fewer." },
      { input: { coins: [2], amount: 3 }, why: "Only 2-cent coins can make 2 or 4, never 3, so the answer is -1." },
      { input: { coins: [1, 2, 5], amount: 0 }, why: "Nothing needs to be paid, so 0 coins are needed." },
    ],
    difficulty: "MEDIUM",
    tags: ["dynamic-programming"],
    samples: [{"coins":[1,2,5],"amount":11},{"coins":[2],"amount":3}],
    hiddens: [{"coins":[1],"amount":0},{"coins":[1,2,5],"amount":0},{"coins":[2,5,10],"amount":1},{"coins":[1,3,4],"amount":6}],
    solve: (input) => {
    const dp = Array(input.amount + 1).fill(Infinity)
    dp[0] = 0
    for (let a = 1; a <= input.amount; a++) {
      for (const c of input.coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1)
    }
    return dp[input.amount] === Infinity ? -1 : dp[input.amount]
  },
  },
  {
    seedKey: "dp-lis-length",
    title: "DP Rising Subsequence",
    story:
      "Kids are standing in a line, and each kid has a height number.\n\nYou want to pick some of them for a photo, keeping them in the same order they stand. In the photo, each picked kid must be **strictly taller** than the one before (no equal heights). You may skip kids, but you may not swap them around.\n\nThe picked kids are called a **subsequence** (some items from the list, kept in their original order). How many kids can be in the longest rising photo?",
    params: [{ name: "nums", type: "number[]", about: "the heights of the kids, in the order they stand." }],
    returns: { type: "number", about: "the length of the longest strictly increasing subsequence." },
    rules: ["Strictly increasing means each picked number is bigger than the one before. Equal numbers do not count.", "You keep the original order, but you may skip numbers.", "An empty list gives `0`."],
    examples: [
      { input: { nums: [0, 1, 0, 3, 2, 3] }, why: "Pick 0, 1, 2, 3 (skipping the second 0 and the first 3). That is 4 kids, the most possible." },
      { input: { nums: [5, 4, 3, 2, 1] }, why: "Every kid is shorter than the one before, so the best photo has just 1 kid." },
      { input: { nums: [] }, why: "There are no kids, so the answer is 0." },
    ],
    difficulty: "HARD",
    tags: ["dynamic-programming","binary-search","array"],
    samples: [{"nums":[10,9,2,5,3,7,101,18]},{"nums":[0,1,0,3,2,3]}],
    hiddens: [{"nums":[]},{"nums":[7]},{"nums":[5,4,3,2,1]},{"nums":[1,3,6,7,9,4,10,5,6]}],
    solve: (input) => {
    const tails = []
    for (const x of input.nums) {
      let lo = 0
      let hi = tails.length
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (tails[mid] < x) lo = mid + 1
        else hi = mid
      }
      tails[lo] = x
    }
    return tails.length
  },
  },
  {
    seedKey: "dp-unique-paths",
    title: "DP Grid Path Count",
    story:
      "A little robot lives on a **grid** (a board of squares, like a chessboard) with `m` rows and `n` columns.\n\nIt starts in the top-left square and wants to get to the bottom-right square. The robot can only move **right** or **down**, one square at a time.\n\nHow many different paths can the robot take?",
    params: [
      { name: "m", type: "number", about: "how many rows the grid has." },
      { name: "n", type: "number", about: "how many columns the grid has." },
    ],
    returns: { type: "number", about: "the number of different paths from the top-left square to the bottom-right square." },
    rules: ["The robot can only move right or down.", "`m` and `n` are both at least 1.", "On a 1 x 1 grid the robot is already there, which counts as 1 path."],
    examples: [
      { input: { m: 3, n: 2 }, why: "The robot needs 1 right move and 2 down moves. The right move can come first, second or third, so there are 3 paths." },
      { input: { m: 2, n: 2 }, why: "Either right then down, or down then right, so there are 2 paths." },
      { input: { m: 1, n: 1 }, why: "Start and finish are the same square, so there is exactly 1 path (do nothing)." },
    ],
    difficulty: "MEDIUM",
    tags: ["dynamic-programming","math","matrix"],
    samples: [{"m":3,"n":7},{"m":3,"n":2}],
    hiddens: [{"m":1,"n":1},{"m":1,"n":10},{"m":7,"n":3},{"m":2,"n":2}],
    solve: (input) => {
    const dp = Array(input.n).fill(1)
    for (let i = 1; i < input.m; i++) for (let j = 1; j < input.n; j++) dp[j] += dp[j - 1]
    return dp[input.n - 1]
  },
  },
  {
    seedKey: "dp-knapsack-01",
    title: "DP Pack Capacity Value",
    story:
      "You are packing a backpack for a treasure hunt. The backpack can hold at most `W` kilograms.\n\nThere are some treasures. Treasure `i` weighs `weights[i]` and is worth `values[i]` points. There is only **one** of each treasure, so you either take it or leave it.\n\nPick treasures so the total weight is not more than `W` and the total points are as big as possible.",
    params: [
      { name: "weights", type: "number[]", about: "how heavy each treasure is." },
      { name: "values", type: "number[]", about: "how many points each treasure is worth, in the same order as `weights`." },
      { name: "W", type: "number", about: "the most weight the backpack can carry." },
    ],
    returns: { type: "number", about: "the most points you can carry without going over the weight limit." },
    rules: ["Each treasure can be taken at most once.", "The total weight may equal `W` but must not be more.", "`weights` and `values` have the same length.", "If nothing fits (or there are no treasures), the answer is `0`."],
    examples: [
      { input: { weights: [1, 2, 3], values: [6, 10, 12], W: 5 }, why: "Take the treasures weighing 2 and 3. That is 5 kg total and 10 + 12 = 22 points, the best you can do." },
      { input: { weights: [2], values: [3], W: 1 }, why: "The only treasure weighs 2, which is more than 1, so you carry nothing and get 0." },
      { input: { weights: [], values: [], W: 10 }, why: "There are no treasures, so the answer is 0." },
    ],
    difficulty: "MEDIUM",
    tags: ["dynamic-programming"],
    samples: [{"weights":[1,2,3],"values":[6,10,12],"W":5},{"weights":[2],"values":[3],"W":1}],
    hiddens: [{"weights":[],"values":[],"W":10},{"weights":[1,1,1],"values":[1,2,3],"W":2},{"weights":[5,4],"values":[10,9],"W":5},{"weights":[2,3,4,5],"values":[3,4,5,6],"W":5}],
    solve: (input) => {
    const dp = Array(input.W + 1).fill(0)
    for (let i = 0; i < input.weights.length; i++) {
      for (let w = input.W; w >= input.weights[i]; w--) {
        dp[w] = Math.max(dp[w], dp[w - input.weights[i]] + input.values[i])
      }
    }
    return dp[input.W]
  },
  },
  {
    seedKey: "dp-word-break",
    title: "DP Lexicon Segment",
    story:
      "Someone wrote a message but forgot all the spaces, so it looks like `leetcode`.\n\nYou also have a word list, `wordDict`. Can you put spaces into the message so that **every piece** is a word from the list?\n\nYou may use the same word as many times as you like.",
    params: [
      { name: "s", type: "string", about: "the message with no spaces." },
      { name: "wordDict", type: "string[]", about: "the list of allowed words." },
    ],
    returns: { type: "boolean", about: "`true` if the whole message can be cut into words from the list, otherwise `false`." },
    rules: ["Words from the list may be used more than once.", "Every letter of `s` must belong to some word; no leftovers.", "An empty message counts as `true` (there is nothing to cut)."],
    examples: [
      { input: { s: "leetcode", wordDict: ["leet", "code"] }, why: "Cut it into \"leet\" + \"code\". Both are in the list, so the answer is true." },
      { input: { s: "catsandog", wordDict: ["cats", "dog", "sand", "and", "cat"] }, why: "\"cats\" + \"and\" leaves \"og\", and \"cat\" + \"sand\" also leaves \"og\". \"og\" is not a word, so the answer is false." },
      { input: { s: "", wordDict: ["a"] }, why: "The message is empty, so there is nothing to cut and the answer is true." },
    ],
    difficulty: "HARD",
    tags: ["dynamic-programming","string","hash-set"],
    samples: [{"s":"leetcode","wordDict":["leet","code"]},{"s":"applepenapple","wordDict":["apple","pen"]}],
    hiddens: [{"s":"catsandog","wordDict":["cats","dog","sand","and","cat"]},{"s":"","wordDict":["a"]},{"s":"a","wordDict":["b"]},{"s":"aaaaaaa","wordDict":["aaaa","aaa"]}],
    solve: (input) => {
    const dict = new Set(input.wordDict)
    const dp = Array(input.s.length + 1).fill(false)
    dp[0] = true
    for (let i = 1; i <= input.s.length; i++) {
      for (let j = 0; j < i; j++) {
        if (dp[j] && dict.has(input.s.slice(j, i))) {
          dp[i] = true
          break
        }
      }
    }
    return dp[input.s.length]
  },
  },
  {
    seedKey: "dp-palindrome-substr-count",
    title: "DP Palindrome Substr Count",
    story:
      "A **palindrome** is a word that reads the same forwards and backwards, like `mom` or `racecar`.\n\nA **substring** is a piece of a word made of letters that sit right next to each other. For example, `ab` and `bc` are substrings of `abc`, but `ac` is not.\n\nGiven a word `s`, count how many of its substrings are palindromes. Pieces that start at different spots count separately, even if they look the same.",
    params: [{ name: "s", type: "string", about: "the word to look inside." }],
    returns: { type: "number", about: "how many substrings of `s` are palindromes." },
    rules: ["Every single letter is a palindrome and counts.", "Substrings at different positions count separately, even if they have the same letters.", "An empty word gives `0`."],
    examples: [
      { input: { s: "aaa" }, why: "There are three \"a\", two \"aa\" (starting at spot 0 and spot 1) and one \"aaa\". That is 3 + 2 + 1 = 6." },
      { input: { s: "abc" }, why: "Only the single letters \"a\", \"b\" and \"c\" are palindromes, so the answer is 3." },
      { input: { s: "" }, why: "An empty word has no substrings, so the answer is 0." },
    ],
    difficulty: "MEDIUM",
    tags: ["string","dynamic-programming"],
    samples: [{"s":"abc"},{"s":"aaa"}],
    hiddens: [{"s":""},{"s":"a"},{"s":"aba"},{"s":"abba"}],
    solve: (input) => {
    const s = input.s
    let count = 0
    const expand = (l, r) => {
      while (l >= 0 && r < s.length && s[l] === s[r]) {
        count++
        l--
        r++
      }
    }
    for (let i = 0; i < s.length; i++) {
      expand(i, i)
      expand(i, i + 1)
    }
    return count
  },
  },
  {
    seedKey: "dp-jump-game-reach",
    title: "DP Jump Reach Gate",
    story:
      "A frog sits on the first of a row of lily pads. Each lily pad has a number on it.\n\nThe number tells the frog the **farthest** it can jump forward from that pad. If the number is 3, the frog can jump 1, 2 or 3 pads ahead. If it is 0, the frog is stuck there.\n\nCan the frog reach the last lily pad?",
    params: [{ name: "nums", type: "number[]", about: "the number on each lily pad, from the first pad to the last." }],
    returns: { type: "boolean", about: "`true` if the frog can reach the last pad starting from the first pad, otherwise `false`." },
    rules: ["The frog starts on pad 0 (the first pad).", "From pad `i` the frog can jump any distance from 1 up to `nums[i]`.", "If there is only one pad, the frog is already on the last pad, so the answer is `true`."],
    examples: [
      { input: { nums: [2, 3, 1, 1, 4] }, why: "Jump 1 pad to the pad with 3, then jump 3 pads to the last pad. So the answer is true." },
      { input: { nums: [3, 2, 1, 0, 4] }, why: "Every path lands on the pad with 0 and gets stuck there, so the frog never reaches the last pad. The answer is false." },
      { input: { nums: [0] }, why: "There is only one pad, and the frog is already on it, so the answer is true." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","greedy","dynamic-programming"],
    samples: [{"nums":[2,3,1,1,4]},{"nums":[3,2,1,0,4]}],
    hiddens: [{"nums":[0]},{"nums":[2,0]},{"nums":[1,0,1]},{"nums":[2,5,0,0]}],
    solve: (input) => {
    let reach = 0
    for (let i = 0; i < input.nums.length; i++) {
      if (i > reach) return false
      reach = Math.max(reach, i + input.nums[i])
    }
    return true
  },
  },
  {
    seedKey: "dp-max-product-subarray",
    title: "DP Pulse Product Peak",
    story:
      "You have a row of number cards. Some numbers may be negative or zero.\n\nYou must pick a **block** of cards that sit right next to each other (at least one card), and **multiply** them all together.\n\nWhich block gives the biggest result? Be careful: two negative numbers multiplied together make a positive number!",
    params: [{ name: "nums", type: "number[]", about: "the numbers on the cards, from left to right." }],
    returns: { type: "number", about: "the biggest product you can get from a block of cards that sit next to each other." },
    rules: ["The block must have at least one card.", "The cards in the block must be next to each other; you cannot skip cards.", "`nums` always has at least one number.", "Numbers can be negative or zero."],
    examples: [
      { input: { nums: [2, 3, -2, 4] }, why: "The block 2, 3 gives 2 x 3 = 6. Any block with the -2 in it is negative or smaller, so the answer is 6." },
      { input: { nums: [-2, 3, -4] }, why: "Take all three cards: -2 x 3 x -4 = 24. The two negatives cancel out." },
      { input: { nums: [-2, 0, -1] }, why: "Every block is either negative or includes the 0, so the best you can do is 0." },
    ],
    difficulty: "MEDIUM",
    tags: ["array","dynamic-programming"],
    samples: [{"nums":[2,3,-2,4]},{"nums":[-2,0,-1]}],
    hiddens: [{"nums":[-2]},{"nums":[0,2]},{"nums":[-2,3,-4]},{"nums":[2,-5,-2,-4,3]}],
    solve: (input) => {
    let maxP = input.nums[0]
    let minP = input.nums[0]
    let ans = input.nums[0]
    for (let i = 1; i < input.nums.length; i++) {
      const x = input.nums[i]
      const cand = [x, maxP * x, minP * x]
      maxP = Math.max(...cand)
      minP = Math.min(...cand)
      ans = Math.max(ans, maxP)
    }
    return ans
  },
  },
  {
    seedKey: "dp-regex-match",
    title: "DP Pattern Match Engine",
    story:
      "You are building a word-guessing machine. It gets a word `s` and a **pattern** `p` (a recipe that describes which words are allowed).\n\nThe pattern is made of normal letters plus two special symbols. A dot `.` matches **any one letter**. A star `*` means \"the thing just before me can appear **zero or more times**\". So `a*` matches \"\", \"a\", \"aa\" and so on, and `.*` matches any word at all.\n\nYour machine must say whether the pattern matches the **whole** word, from the first letter to the last.",
    params: [
      { name: "s", type: "string", about: "the word to check." },
      { name: "p", type: "string", about: "the pattern, made of letters, `.` and `*`." },
    ],
    returns: { type: "boolean", about: "`true` if the pattern matches the entire word, otherwise `false`." },
    rules: ["`.` matches exactly one letter, any letter.", "`*` means zero or more copies of the character right before it.", "The pattern must match the whole word, not just part of it.", "An empty pattern matches only an empty word."],
    examples: [
      { input: { s: "aa", p: "a" }, why: "The pattern \"a\" matches only one letter, but the word has two, so the answer is false." },
      { input: { s: "aa", p: "a*" }, why: "\"a*\" means any number of a's, so it can match two a's. The answer is true." },
      { input: { s: "aab", p: "c*a*b" }, why: "Use \"c*\" zero times, \"a*\" twice for \"aa\", and then \"b\" matches \"b\". The answer is true." },
    ],
    difficulty: "HARD",
    tags: ["string","dynamic-programming","recursion"],
    samples: [{"s":"aa","p":"a"},{"s":"aa","p":"a*"}],
    hiddens: [{"s":"ab","p":".*"},{"s":"aab","p":"c*a*b"},{"s":"","p":""},{"s":"mississippi","p":"mis*is*p*."}],
    solve: (input) => {
    const s = input.s
    const p = input.p
    const m = s.length
    const n = p.length
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(false))
    dp[0][0] = true
    for (let j = 2; j <= n; j++) if (p[j - 1] === "*" && dp[0][j - 2]) dp[0][j] = true
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (p[j - 1] === "*") {
          dp[i][j] = dp[i][j - 2]
          if (p[j - 2] === "." || p[j - 2] === s[i - 1]) dp[i][j] = dp[i][j] || dp[i - 1][j]
        } else if (p[j - 1] === "." || p[j - 1] === s[i - 1]) dp[i][j] = dp[i - 1][j - 1]
      }
    }
    return dp[m][n]
  },
  },
]
