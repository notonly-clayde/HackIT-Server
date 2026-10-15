import type { CatalogProblemDef } from "../types.js"

// Hash map / set
export const hashMapProblems: CatalogProblemDef[] = [
  {
    seedKey: "radar-two-sum-indices",
    title: "Radar Two-Index Lock",
    story:
      "A row of treasure boxes each has a number of gold coins inside.\n\nA pirate wants to open exactly **two different boxes** so the coins add up to a magic number, the `target`. Which two boxes should she open?\n\nYou get the coin counts as an **array** (a list of numbers in order). Boxes are counted from spot `0`. A **hash map** (a lookup table) can help you remember which numbers you have already seen and where.",
    params: [
      { name: "nums", type: "number[]", about: "the coins in each box, from left to right." },
      { name: "target", type: "number", about: "the magic total the two boxes must add up to." },
    ],
    returns: { type: "number[]", about: "the two box spots `[i, j]` whose coins add up to `target`, smaller spot first." },
    rules: ["There is always exactly one right pair.", "You must pick two different boxes (you cannot use the same box twice), but two boxes can hold the same number.", "Spots are 0-based: the first box is spot `0`.", "Numbers can be zero or negative."],
    examples: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, why: "Box 0 has 2 and box 1 has 7, and 2 + 7 = 9." },
      { input: { nums: [3, 2, 4], target: 6 }, why: "Box 1 has 2 and box 2 has 4, and 2 + 4 = 6. Box 0 cannot be used twice." },
      { input: { nums: [3, 3], target: 6 }, why: "Both boxes hold 3, and 3 + 3 = 6, so the answer is boxes 0 and 1." },
    ],
    difficulty: "EASY",
    tags: ["array","hash-map"],
    samples: [{"nums":[2,7,11,15],"target":9},{"nums":[3,2,4],"target":6}],
    hiddens: [{"nums":[3,3],"target":6},{"nums":[0,4,3,0],"target":0},{"nums":[-1,-2,-3,-4,-5],"target":-8},{"nums":[1,5,3],"target":8}],
    solve: (input) => {
    const map = new Map()
    for (let i = 0; i < input.nums.length; i++) {
      const need = input.target - input.nums[i]
      if (map.has(need)) return [map.get(need), i]
      map.set(input.nums[i], i)
    }
    return []
  },
  },
  {
    seedKey: "vault-first-unique-char",
    title: "Vault First Unique Char",
    story:
      "A secret vault opens with a word. The guard says: \"Find the first letter in the word that shows up **only once**.\"\n\nYou get the word as a **string** (a piece of text). Count how many times each letter appears, then walk through the word from the start and stop at the first letter that appears just one time.\n\nA **hash map** (a lookup table) is a handy way to keep the counts.",
    params: [{ name: "s", type: "string", about: "the secret word." }],
    returns: { type: "number", about: "the spot of the first letter that appears only once, or `-1` if there is none." },
    rules: ["Spots are 0-based: the first letter is spot `0`.", "If every letter repeats, or the word is empty, return `-1`."],
    examples: [
      { input: { s: "leetcode" }, why: "The letter `l` at spot 0 appears only once, so the answer is 0." },
      { input: { s: "loveleetcode" }, why: "`l` and `o` repeat. The letter `v` at spot 2 appears only once, so the answer is 2." },
      { input: { s: "aabb" }, why: "Every letter appears twice, so there is no answer and we return -1." },
    ],
    difficulty: "EASY",
    tags: ["string","hash-map"],
    samples: [{"s":"leetcode"},{"s":"loveleetcode"}],
    hiddens: [{"s":"aabb"},{"s":"z"},{"s":""},{"s":"abcab"}],
    solve: (input) => {
    const cnt = {}
    for (const c of input.s) cnt[c] = (cnt[c] || 0) + 1
    for (let i = 0; i < input.s.length; i++) if (cnt[input.s[i]] === 1) return i
    return -1
  },
  },
  {
    seedKey: "ledger-subarray-sum-k",
    title: "Ledger Subarray Sum K",
    story:
      "A shopkeeper writes down how much money comes in or goes out each hour in a notebook.\n\nShe wants to know: how many **unbroken stretches** of hours add up to exactly `k` dollars? A stretch is one or more hours right next to each other, with no gaps.\n\nYou get the hours as an **array** (a list of numbers in order). Tip: keep a running total, and use a **hash map** (a lookup table) to count how often each running total has shown up.",
    params: [
      { name: "nums", type: "number[]", about: "the money for each hour, in order. Negative means money went out." },
      { name: "k", type: "number", about: "the total a stretch must add up to." },
    ],
    returns: { type: "number", about: "how many unbroken stretches add up to exactly `k`." },
    rules: ["A stretch must be at least one hour long and cannot skip hours.", "Stretches that start or end at different hours count separately, even if they have the same numbers.", "Numbers can be zero or negative.", "An empty notebook has no stretches, so return `0`."],
    examples: [
      { input: { nums: [1, 1, 1], k: 2 }, why: "Hours 0-1 add to 2 and hours 1-2 add to 2, so there are 2 stretches." },
      { input: { nums: [1, 2, 3], k: 3 }, why: "Hours 0-1 give 1 + 2 = 3, and hour 2 alone is 3, so the answer is 2." },
      { input: { nums: [-1, -1, 1], k: 0 }, why: "Only hours 1-2 work: -1 + 1 = 0. So the answer is 1." },
    ],
    difficulty: "HARD",
    tags: ["array","hash-map","prefix-sum"],
    samples: [{"nums":[1,1,1],"k":2},{"nums":[1,2,3],"k":3}],
    hiddens: [{"nums":[1],"k":0},{"nums":[-1,-1,1],"k":0},{"nums":[],"k":1},{"nums":[3,4,7,2,-3,1,4,2],"k":7}],
    solve: (input) => {
    const map = new Map([[0, 1]])
    let sum = 0
    let count = 0
    for (const x of input.nums) {
      sum += x
      count += map.get(sum - input.k) || 0
      map.set(sum, (map.get(sum) || 0) + 1)
    }
    return count
  },
  },
  {
    seedKey: "badge-longest-consecutive",
    title: "Badge Longest Consecutive",
    story:
      "Kids at a club each wear a numbered badge. The badges are all mixed up in a pile.\n\nThe coach wants the longest **run** of badges that count up by one with no gaps, like 4, 5, 6, 7. The badges do not have to be next to each other in the pile.\n\nYou get the badges as an **array** (a list of numbers). A **hash set** (a bag where you can quickly check \"is this number here?\") makes this fast.",
    params: [{ name: "nums", type: "number[]", about: "the badge numbers, in any order." }],
    returns: { type: "number", about: "how many badges are in the longest run of numbers that go up by one." },
    rules: ["Repeated badges only count once in a run.", "Numbers can be negative.", "An empty pile gives `0`."],
    examples: [
      { input: { nums: [100, 4, 200, 1, 3, 2] }, why: "The badges 1, 2, 3, 4 form a run of 4. Nothing longer exists." },
      { input: { nums: [1, 2, 0, 1] }, why: "The run is 0, 1, 2. The extra 1 does not make it longer, so the answer is 3." },
      { input: { nums: [] }, why: "There are no badges, so the answer is 0." },
    ],
    difficulty: "HARD",
    tags: ["array","hash-set"],
    samples: [{"nums":[100,4,200,1,3,2]},{"nums":[0,3,7,2,5,8,4,6,0,1]}],
    hiddens: [{"nums":[]},{"nums":[1]},{"nums":[1,2,0,1]},{"nums":[9,1,4,7,3,-1,0,5,8,-1,6]}],
    solve: (input) => {
    const set = new Set(input.nums)
    let best = 0
    for (const x of set) {
      if (!set.has(x - 1)) {
        let y = x
        let len = 1
        while (set.has(y + 1)) {
          y++
          len++
        }
        best = Math.max(best, len)
      }
    }
    return best
  },
  },
  {
    seedKey: "token-top-k-frequent",
    title: "Token Top K Frequent",
    story:
      "At an arcade, every game you win gives you a token with a number on it.\n\nAt the end of the day you dump all your tokens on the table. Which `k` numbers did you get the **most often**?\n\nYou get the tokens as an **array** (a list of numbers). A **hash map** (a lookup table) is great for counting how many of each number you have.",
    params: [
      { name: "nums", type: "number[]", about: "the number on each token you won." },
      { name: "k", type: "number", about: "how many of the most common numbers to return." },
    ],
    returns: { type: "number[]", about: "exactly `k` different numbers that appear the most often in `nums`." },
    rules: ["Return exactly `k` numbers, from most common to least common.", "If two numbers appear the same number of times, put the one that shows up first in `nums` first."],
    examples: [
      { input: { nums: [1, 1, 1, 2, 2, 3], k: 2 }, why: "1 appears 3 times and 2 appears 2 times. Those are the top 2." },
      { input: { nums: [4, 4, 4, 5, 5, 6], k: 1 }, why: "4 appears the most (3 times), so it is the only one returned." },
      { input: { nums: [1, 2], k: 2 }, why: "Both numbers appear once and we need 2 of them, so we return both." },
    ],
    difficulty: "MEDIUM",
    tags: ["hash-map","heap"],
    samples: [{"nums":[1,1,1,2,2,3],"k":2},{"nums":[1],"k":1}],
    hiddens: [{"nums":[4,4,4,5,5,6],"k":1},{"nums":[1,2],"k":2},{"nums":[3,3,3,2,2,1],"k":3},{"nums":[7,7,7,7],"k":1}],
    solve: (input) => {
    const freq = new Map()
    for (const x of input.nums) freq.set(x, (freq.get(x) || 0) + 1)
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, input.k)
      .map(([v]) => v)
  },
  },
  {
    seedKey: "alias-isomorphic-strings",
    title: "Alias Isomorphic Strings",
    story:
      "Two friends invent a secret code. Each letter in a word is swapped for a code letter.\n\nThe code has strict rules: the same letter must always turn into the same code letter, and two different letters can never turn into the same code letter.\n\nYou get two **strings** (pieces of text), `s` and `t`. Could `t` be the secret-code version of `s`? Words that match like this are called **isomorphic**.",
    params: [
      { name: "s", type: "string", about: "the original word." },
      { name: "t", type: "string", about: "the word that might be its coded version." },
    ],
    returns: { type: "boolean", about: "`true` if there is a one-to-one letter swap that turns `s` into `t`, otherwise `false`." },
    rules: ["Each letter in `s` always maps to the same letter in `t`, and no two letters in `s` map to the same letter in `t`.", "A letter may map to itself.", "If the words have different lengths, return `false`.", "Two empty words count as a match, so return `true`."],
    examples: [
      { input: { s: "egg", t: "add" }, why: "e becomes a and g becomes d every time, so it works." },
      { input: { s: "foo", t: "bar" }, why: "The letter o would have to become both a and r, which breaks the rules." },
      { input: { s: "ab", t: "aa" }, why: "Both a and b would turn into a, but two different letters cannot share a code letter." },
    ],
    difficulty: "EASY",
    tags: ["string","hash-map"],
    samples: [{"s":"egg","t":"add"},{"s":"foo","t":"bar"}],
    hiddens: [{"s":"paper","t":"title"},{"s":"ab","t":"aa"},{"s":"","t":""},{"s":"badc","t":"baba"}],
    solve: (input) => {
    const { s, t } = input
    if (s.length !== t.length) return false
    const st = new Map()
    const ts = new Map()
    for (let i = 0; i < s.length; i++) {
      if (st.has(s[i]) && st.get(s[i]) !== t[i]) return false
      if (ts.has(t[i]) && ts.get(t[i]) !== s[i]) return false
      st.set(s[i], t[i])
      ts.set(t[i], s[i])
    }
    return true
  },
  },
  {
    seedKey: "hashwire-four-sum-count",
    title: "Hashwire Four Sum Count",
    story:
      "You have four bags of number cards: bag `A`, bag `B`, bag `C` and bag `D`.\n\nYou pull **one card from each bag**. How many different ways can you pick four cards so they add up to exactly `0`?\n\nEach bag is an **array** (a list of numbers). Tip: add up every pair from `A` and `B` first and store the counts in a **hash map** (a lookup table), then check pairs from `C` and `D`.",
    params: [
      { name: "A", type: "number[]", about: "the cards in the first bag." },
      { name: "B", type: "number[]", about: "the cards in the second bag." },
      { name: "C", type: "number[]", about: "the cards in the third bag." },
      { name: "D", type: "number[]", about: "the cards in the fourth bag." },
    ],
    returns: { type: "number", about: "how many ways to pick spots `i, j, k, l` so that `A[i] + B[j] + C[k] + D[l]` equals `0`." },
    rules: ["Picks are counted by spot, so two cards with the same number in one bag count as different picks.", "Numbers can be zero or negative.", "If any bag is empty, there are no picks, so return `0`."],
    examples: [
      { input: { A: [1, 2], B: [-2, -1], C: [-1, 2], D: [0, 2] }, why: "1 + (-2) + (-1) + 2 = 0 and 2 + (-1) + (-1) + 0 = 0. No other pick works, so the answer is 2." },
      { input: { A: [0], B: [0], C: [0], D: [0] }, why: "There is only one way to pick, and 0 + 0 + 0 + 0 = 0, so the answer is 1." },
      { input: { A: [1], B: [-1], C: [0], D: [1] }, why: "The only pick is 1 + (-1) + 0 + 1 = 1, which is not 0, so the answer is 0." },
    ],
    difficulty: "HARD",
    tags: ["array","hash-map"],
    samples: [{"A":[1,2],"B":[-2,-1],"C":[-1,2],"D":[0,2]},{"A":[0],"B":[0],"C":[0],"D":[0]}],
    hiddens: [{"A":[1],"B":[-1],"C":[0],"D":[1]},{"A":[1,1],"B":[-1,-1],"C":[0,0],"D":[0,1]},{"A":[],"B":[],"C":[],"D":[]},{"A":[1,2,3],"B":[-1,-2],"C":[0],"D":[0]}],
    solve: (input) => {
    const map = new Map()
    for (const a of input.A) for (const b of input.B) map.set(a + b, (map.get(a + b) || 0) + 1)
    let count = 0
    for (const c of input.C) for (const d of input.D) count += map.get(-(c + d)) || 0
    return count
  },
  },
  {
    seedKey: "signalset-contains-nearby",
    title: "Signalset Nearby Duplicate",
    story:
      "A line of kids are each holding a colored balloon, written as a number.\n\nThe teacher asks: are there two kids holding the **same** balloon who are standing **close together**, at most `k` spots apart?\n\nYou get the balloons as an **array** (a list of numbers in order). A **hash map** (a lookup table) can remember the last spot where you saw each number.",
    params: [
      { name: "nums", type: "number[]", about: "the balloon number for each kid, from left to right." },
      { name: "k", type: "number", about: "the biggest distance apart the two kids may stand." },
    ],
    returns: { type: "boolean", about: "`true` if two different kids at spots `i` and `j` hold the same number and `j - i` is at most `k`, otherwise `false`." },
    rules: ["The two kids must be different kids (different spots).", "Distance is the difference between their spots.", "An empty line or a single kid gives `false`."],
    examples: [
      { input: { nums: [1, 2, 3, 1], k: 3 }, why: "The two 1s are at spots 0 and 3, which is 3 apart. That is at most 3, so the answer is true." },
      { input: { nums: [1, 2, 3, 1, 2, 3], k: 2 }, why: "Every matching pair is 3 spots apart, which is more than 2, so the answer is false." },
      { input: { nums: [1], k: 1 }, why: "Only one kid means no pair, so the answer is false." },
    ],
    difficulty: "EASY",
    tags: ["array","hash-map"],
    samples: [{"nums":[1,2,3,1],"k":3},{"nums":[1,2,3,1,2,3],"k":2}],
    hiddens: [{"nums":[1,0,1,1],"k":1},{"nums":[],"k":0},{"nums":[1],"k":1},{"nums":[99,99],"k":2}],
    solve: (input) => {
    const last = new Map()
    for (let i = 0; i < input.nums.length; i++) {
      if (last.has(input.nums[i]) && i - last.get(input.nums[i]) <= input.k) return true
      last.set(input.nums[i], i)
    }
    return false
  },
  },
]
