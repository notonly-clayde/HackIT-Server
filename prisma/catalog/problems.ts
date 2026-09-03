import type { CatalogProblemDef } from "./types.js"

export const catalogProblems: CatalogProblemDef[] = [

  // --- Arrays ---
  {
    seedKey: "pulse-max-gap",
    title: "Pulse Max Gap",
    statement: "## Pulse Max Gap\n\nGiven an array of integers `nums`, return the maximum difference between any two adjacent values after sorting. If fewer than two elements, return 0.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Signal Running Product\n\nGiven `nums`, return an array `out` where `out[i]` is the product of every element in `nums` except `nums[i]`. Do not use division. Empty input yields empty output.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Breach Rotate K\n\nRotate array `nums` to the right by `k` steps. Return the rotated array. `k` may be larger than the length.\n\n**Input:** `{ \"nums\": number[], \"k\": number }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Forge Missing Span\n\nGiven `nums` containing distinct integers in `[0, n]` with one missing, return the missing number. `n` is the length of `nums`.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Cacheline Majority Vote\n\nReturn the majority element in `nums` (appears more than `floor(n/2)` times). It is guaranteed to exist.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Packet Duplicate Once\n\nIn `nums` of length `n+1`, values are in `1..n` and exactly one value appears twice. Return that duplicate.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Relay Max Subarray\n\nReturn the maximum sum of any contiguous subarray of `nums`. Array is non-empty.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Warp Move Zeros\n\nMove all zeros in `nums` to the end while preserving relative order of non-zeros. Return the modified array.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Nexus Third Distinct\n\nReturn the third distinct maximum in `nums`. If fewer than three distinct values exist, return the maximum.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Oxide Intersection Sorted\n\nGiven two sorted arrays `a` and `b`, return their intersection as a sorted array of unique values.\n\n**Input:** `{ \"a\": number[], \"b\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Vector Peak Index\n\n`nums` is a mountain array (strictly increases then strictly decreases). Return any peak index (0-based).\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Shard Kth Largest\n\nReturn the `k`-th largest element in `nums` (1-indexed from largest).\n\n**Input:** `{ \"nums\": number[], \"k\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Flux Container Water\n\nGiven heights `h`, choose two lines that with the x-axis form a container holding the most water. Return that max area.\n\n**Input:** `{ \"h\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Orbit Next Permutation\n\nRearrange `nums` into the next lexicographical permutation. If none exists, rearrange into the lowest possible order. Return the result.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Delta First Missing Positive\n\nFind the smallest missing positive integer in `nums` (1-based positives).\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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

  // --- Strings ---
  {
    seedKey: "cipher-is-anagram",
    title: "Cipher Is Anagram",
    statement: "## Cipher Is Anagram\n\nReturn true if `s` and `t` are anagrams (same characters with same frequencies).\n\n**Input:** `{ \"s\": string, \"t\": string }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["string","hash-map"],
    samples: [{"s":"listen","t":"silent"},{"s":"rat","t":"car"}],
    hiddens: [{"s":"","t":""},{"s":"a","t":"a"},{"s":"ab","t":"ba"},{"s":"aabb","t":"abab"}],
    solve: (input) => {
    if (input.s.length !== input.t.length) return false
    const cnt = {}
    for (const c of input.s) cnt[c] = (cnt[c] || 0) + 1
    for (const c of input.t) {
      if (!cnt[c]) return false
      cnt[c]--
    }
    return true
  },
  },
  {
    seedKey: "glyph-reverse-words",
    title: "Glyph Reverse Words",
    statement: "## Glyph Reverse Words\n\nReverse the order of words in `s`. Words are separated by spaces; collapse multiple spaces; trim ends.\n\n**Input:** `{ \"s\": string }`\n\n**Output:** string\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["string"],
    samples: [{"s":"the sky is blue"},{"s":"  hello world  "}],
    hiddens: [{"s":"a"},{"s":"  "},{"s":"one  two   three"},{"s":"HackIT rocks"}],
    solve: (input) =>
    input.s
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .reverse()
      .join(" "),
  },
  {
    seedKey: "echo-longest-unique",
    title: "Echo Longest Unique",
    statement: "## Echo Longest Unique\n\nReturn the length of the longest substring of `s` without repeating characters.\n\n**Input:** `{ \"s\": string }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["string","sliding-window","hash-map"],
    samples: [{"s":"abcabcbb"},{"s":"bbbbb"}],
    hiddens: [{"s":""},{"s":"au"},{"s":"pwwkew"},{"s":"dvdf"}],
    solve: (input) => {
    const s = input.s
    const last = new Map()
    let best = 0
    let start = 0
    for (let i = 0; i < s.length; i++) {
      if (last.has(s[i]) && last.get(s[i]) >= start) start = last.get(s[i]) + 1
      last.set(s[i], i)
      best = Math.max(best, i - start + 1)
    }
    return best
  },
  },
  {
    seedKey: "mirror-palindrome-check",
    title: "Mirror Palindrome Check",
    statement: "## Mirror Palindrome Check\n\nReturn true if `s` is a palindrome considering only alphanumeric characters, ignoring case.\n\n**Input:** `{ \"s\": string }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["string","two-pointers"],
    samples: [{"s":"A man, a plan, a canal: Panama"},{"s":"race a car"}],
    hiddens: [{"s":""},{"s":" "},{"s":"0P"},{"s":"ab_a"}],
    solve: (input) => {
    const t = input.s.toLowerCase().replace(/[^a-z0-9]/g, "")
    let l = 0
    let r = t.length - 1
    while (l < r) {
      if (t[l] !== t[r]) return false
      l++
      r--
    }
    return true
  },
  },
  {
    seedKey: "strand-compress-run",
    title: "Strand Compress Run",
    statement: "## Strand Compress Run\n\nCompress `chars` (array of characters) using run-length encoding written back into a new array: letter then count if count>1. Return the compressed character array.\n\n**Input:** `{ \"chars\": string[] }`\n\n**Output:** string[]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["string","two-pointers"],
    samples: [{"chars":["a","a","b","b","c","c","c"]},{"chars":["a"]}],
    hiddens: [{"chars":["a","b","b","b","b","b","b","b","b","b","b","b","b"]},{"chars":[]},{"chars":["a","a","a"]},{"chars":["z","z","y"]}],
    solve: (input) => {
    const chars = input.chars
    const out = []
    let i = 0
    while (i < chars.length) {
      const c = chars[i]
      let j = i
      while (j < chars.length && chars[j] === c) j++
      out.push(c)
      const cnt = j - i
      if (cnt > 1) for (const d of String(cnt)) out.push(d)
      i = j
    }
    return out
  },
  },
  {
    seedKey: "keymap-group-anagrams",
    title: "Keymap Group Anagrams",
    statement: "## Keymap Group Anagrams\n\nGroup strings in `strs` that are anagrams of each other. Return groups as arrays of strings (order of groups and within groups may follow first-seen key order / original order).\n\n**Input:** `{ \"strs\": string[] }`\n\n**Output:** string[][]\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["string","hash-map"],
    samples: [{"strs":["eat","tea","tan","ate","nat","bat"]},{"strs":[""]}],
    hiddens: [{"strs":[]},{"strs":["a"]},{"strs":["abc","bca","cab","xyz"]},{"strs":["ab","ba","cd"]}],
    solve: (input) => {
    const map = new Map()
    for (const s of input.strs) {
      const key = [...s].sort().join("")
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    }
    return [...map.values()]
  },
  },
  {
    seedKey: "beacon-atoi",
    title: "Beacon Atoi",
    statement: "## Beacon Atoi\n\nParse `s` as a 32-bit signed integer: skip leading spaces, optional sign, digits. Clamp to [-2^31, 2^31-1]. Non-digit stops parsing.\n\n**Input:** `{ \"s\": string }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["string","math"],
    samples: [{"s":"42"},{"s":"   -42"}],
    hiddens: [{"s":"4193 with words"},{"s":"words and 987"},{"s":"-91283472332"},{"s":"+1"}],
    solve: (input) => {
    let i = 0
    const s = input.s
    const n = s.length
    while (i < n && s[i] === " ") i++
    let sign = 1
    if (i < n && (s[i] === "+" || s[i] === "-")) {
      if (s[i] === "-") sign = -1
      i++
    }
    let num = 0
    const INT_MAX = 2147483647
    const INT_MIN = -2147483648
    while (i < n && s[i] >= "0" && s[i] <= "9") {
      const d = s[i].charCodeAt(0) - 48
      if (num > Math.floor((INT_MAX - d) / 10)) return sign === 1 ? INT_MAX : INT_MIN
      num = num * 10 + d
      i++
    }
    return sign * num
  },
  },
  {
    seedKey: "lattice-longest-common-prefix",
    title: "Lattice Longest Common Prefix",
    statement: "## Lattice Longest Common Prefix\n\nReturn the longest common prefix string among `strs`. If none, return empty string.\n\n**Input:** `{ \"strs\": string[] }`\n\n**Output:** string\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["string"],
    samples: [{"strs":["flower","flow","flight"]},{"strs":["dog","racecar","car"]}],
    hiddens: [{"strs":[]},{"strs":["alone"]},{"strs":["a","a","a"]},{"strs":["interspecies","interstellar","interstate"]}],
    solve: (input) => {
    const strs = input.strs
    if (!strs.length) return ""
    let prefix = strs[0]
    for (let i = 1; i < strs.length; i++) {
      while (!strs[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1)
        if (!prefix) return ""
      }
    }
    return prefix
  },
  },
  {
    seedKey: "parity-valid-brackets",
    title: "Parity Valid Brackets",
    statement: "## Parity Valid Brackets\n\nReturn true if `s` containing only `()[]{}` is correctly matched and nested.\n\n**Input:** `{ \"s\": string }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["string","stack"],
    samples: [{"s":"()[]{}"},{"s":"(]"}],
    hiddens: [{"s":""},{"s":"([{}])"},{"s":"((("},{"s":"{[()]}"}],
    solve: (input) => {
    const stack = []
    const map = { ")": "(", "]": "[", "}": "{" }
    for (const c of input.s) {
      if (c === "(" || c === "[" || c === "{") stack.push(c)
      else {
        if (!stack.length || stack.pop() !== map[c]) return false
      }
    }
    return stack.length === 0
  },
  },
  {
    seedKey: "neon-count-and-say",
    title: "Neon Count And Say",
    statement: "## Neon Count And Say\n\nThe count-and-say sequence starts with `\"1\"`. Each term describes the previous. Return the `n`-th term (1-indexed).\n\n**Input:** `{ \"n\": number }`\n\n**Output:** string\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["string","simulation"],
    samples: [{"n":1},{"n":4}],
    hiddens: [{"n":2},{"n":5},{"n":6},{"n":3}],
    solve: (input) => {
    let s = "1"
    for (let step = 1; step < input.n; step++) {
      let next = ""
      let i = 0
      while (i < s.length) {
        let j = i
        while (j < s.length && s[j] === s[i]) j++
        next += String(j - i) + s[i]
        i = j
      }
      s = next
    }
    return s
  },
  },
  {
    seedKey: "ribbon-min-window",
    title: "Ribbon Min Window",
    statement: "## Ribbon Min Window\n\nFind the minimum window substring of `s` that covers all characters in `t` (including duplicates). Return empty string if impossible.\n\n**Input:** `{ \"s\": string, \"t\": string }`\n\n**Output:** string\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["string","sliding-window","hash-map"],
    samples: [{"s":"ADOBECODEBANC","t":"ABC"},{"s":"a","t":"a"}],
    hiddens: [{"s":"a","t":"aa"},{"s":"ab","t":"b"},{"s":"","t":"a"},{"s":"cabwefgewcwaefgcf","t":"cae"}],
    solve: (input) => {
    const { s, t } = input
    if (!t.length || s.length < t.length) return ""
    const need = {}
    for (const c of t) need[c] = (need[c] || 0) + 1
    let missing = t.length
    let best = ""
    let bestLen = Infinity
    let l = 0
    for (let r = 0; r < s.length; r++) {
      const c = s[r]
      if (need[c] !== undefined) {
        if (need[c] > 0) missing--
        need[c]--
      }
      while (missing === 0) {
        if (r - l + 1 < bestLen) {
          bestLen = r - l + 1
          best = s.slice(l, r + 1)
        }
        const left = s[l]
        if (need[left] !== undefined) {
          need[left]++
          if (need[left] > 0) missing++
        }
        l++
      }
    }
    return best
  },
  },
  {
    seedKey: "motif-edit-distance",
    title: "Motif Edit Distance",
    statement: "## Motif Edit Distance\n\nReturn the Levenshtein edit distance between strings `a` and `b` (insert, delete, replace).\n\n**Input:** `{ \"a\": string, \"b\": string }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["string","dynamic-programming"],
    samples: [{"a":"horse","b":"ros"},{"a":"intention","b":"execution"}],
    hiddens: [{"a":"","b":""},{"a":"a","b":""},{"a":"abc","b":"abc"},{"a":"kitten","b":"sitting"}],
    solve: (input) => {
    const a = input.a
    const b = input.b
    const m = a.length
    const n = b.length
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1]
        else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
    return dp[m][n]
  },
  },

  // --- Hash map / set ---
  {
    seedKey: "radar-two-sum-indices",
    title: "Radar Two-Index Lock",
    statement: "## Radar Two-Index Lock\n\nReturn indices of two distinct numbers in `nums` that add to `target`. Exactly one solution exists.\n\n**Input:** `{ \"nums\": number[], \"target\": number }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Vault First Unique Char\n\nReturn the 0-based index of the first non-repeating character in `s`, or -1 if none.\n\n**Input:** `{ \"s\": string }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Ledger Subarray Sum K\n\nCount the number of contiguous subarrays of `nums` whose sum equals `k`.\n\n**Input:** `{ \"nums\": number[], \"k\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Badge Longest Consecutive\n\nReturn the length of the longest consecutive elements sequence in `nums` (unsorted).\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Token Top K Frequent\n\nReturn the `k` most frequent numbers in `nums` (any order among ties is acceptable; return exactly k values).\n\n**Input:** `{ \"nums\": number[], \"k\": number }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Alias Isomorphic Strings\n\nReturn true if `s` and `t` are isomorphic (bijection between characters).\n\n**Input:** `{ \"s\": string, \"t\": string }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
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
    statement: "## Hashwire Four Sum Count\n\nCount tuples (i,j,k,l) such that `A[i]+B[j]+C[k]+D[l] === 0`.\n\n**Input:** `{ \"A\": number[], \"B\": number[], \"C\": number[], \"D\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Signalset Nearby Duplicate\n\nReturn true if any value appears at least twice and the index distance is at most `k`.\n\n**Input:** `{ \"nums\": number[], \"k\": number }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
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

  // --- Stack / queue / monotonic ---
  {
    seedKey: "stackgate-daily-temps",
    title: "Stackgate Daily Temps",
    statement: "## Stackgate Daily Temps\n\nFor each day temperature in `temps`, return how many days you wait until a warmer temperature. 0 if none.\n\n**Input:** `{ \"temps\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["array","stack","monotonic-stack"],
    samples: [{"temps":[73,74,75,71,69,72,76,73]},{"temps":[30,40,50,60]}],
    hiddens: [{"temps":[30,60,90]},{"temps":[90]},{"temps":[]},{"temps":[55,54,53]}],
    solve: (input) => {
    const t = input.temps
    const ans = Array(t.length).fill(0)
    const stack = []
    for (let i = 0; i < t.length; i++) {
      while (stack.length && t[i] > t[stack[stack.length - 1]]) {
        const j = stack.pop()
        ans[j] = i - j
      }
      stack.push(i)
    }
    return ans
  },
  },
  {
    seedKey: "queuewire-recent-counter",
    title: "Queuewire Ping Window",
    statement: "## Queuewire Ping Window\n\nGiven sorted ping times `pings` (ms), for each ping return how many pings fall in `[t-3000, t]` inclusive as an array of counts in order.\n\n**Input:** `{ \"pings\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["queue","sliding-window"],
    samples: [{"pings":[1,100,3001,3002]},{"pings":[1]}],
    hiddens: [{"pings":[]},{"pings":[1,2,3]},{"pings":[1,3001,6001]},{"pings":[100,200,300,3100]}],
    solve: (input) => {
    const q = []
    const out = []
    for (const t of input.pings) {
      q.push(t)
      while (q[0] < t - 3000) q.shift()
      out.push(q.length)
    }
    return out
  },
  },
  {
    seedKey: "monolith-largest-rectangle",
    title: "Monolith Largest Rectangle",
    statement: "## Monolith Largest Rectangle\n\nGiven histogram bar heights `heights`, return the area of the largest rectangle in the histogram.\n\n**Input:** `{ \"heights\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["array","stack","monotonic-stack"],
    samples: [{"heights":[2,1,5,6,2,3]},{"heights":[2,4]}],
    hiddens: [{"heights":[]},{"heights":[1]},{"heights":[5,4,3,2,1]},{"heights":[1,2,3,4,5]}],
    solve: (input) => {
    const h = [...input.heights, 0]
    const stack = [-1]
    let best = 0
    for (let i = 0; i < h.length; i++) {
      while (stack.length > 1 && h[i] < h[stack[stack.length - 1]]) {
        const height = h[stack.pop()]
        const width = i - stack[stack.length - 1] - 1
        best = Math.max(best, height * width)
      }
      stack.push(i)
    }
    return best
  },
  },
  {
    seedKey: "clamp-min-stack-ops",
    title: "Clamp Min-Stack Trace",
    statement: "## Clamp Min-Stack Trace\n\nProcess stack operations. `ops` is an array of `[op, val?]` where op is `push`|`pop`|`top`|`getMin`. Return an array of results for `top` and `getMin` (null for missing). `push`/`pop` produce no output entries.\n\n**Input:** `{ \"ops\": any[] }`\n\n**Output:** (number|null)[]\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["stack"],
    samples: [{"ops":[["push",-2],["push",0],["push",-3],["getMin"],["pop"],["top"],["getMin"]]},{"ops":[["push",1],["top"]]}],
    hiddens: [{"ops":[["push",5],["getMin"],["pop"],["getMin"]]},{"ops":[["push",1],["push",2],["push",1],["getMin"],["pop"],["getMin"]]},{"ops":[["top"]]},{"ops":[["push",0],["push",1],["push",0],["getMin"],["pop"],["getMin"]]}],
    solve: (input) => {
    const st = []
    const mins = []
    const out = []
    for (const op of input.ops) {
      if (op[0] === "push") {
        st.push(op[1])
        mins.push(mins.length ? Math.min(mins[mins.length - 1], op[1]) : op[1])
      } else if (op[0] === "pop") {
        st.pop()
        mins.pop()
      } else if (op[0] === "top") out.push(st.length ? st[st.length - 1] : null)
      else if (op[0] === "getMin") out.push(mins.length ? mins[mins.length - 1] : null)
    }
    return out
  },
  },
  {
    seedKey: "deque-max-sliding",
    title: "Deque Max Sliding",
    statement: "## Deque Max Sliding\n\nReturn an array of maximums of each sliding window of size `k` over `nums`.\n\n**Input:** `{ \"nums\": number[], \"k\": number }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["array","queue","sliding-window","monotonic-stack"],
    samples: [{"nums":[1,3,-1,-3,5,3,6,7],"k":3},{"nums":[1],"k":1}],
    hiddens: [{"nums":[9,8,7,6],"k":2},{"nums":[1,-1],"k":1},{"nums":[7,2,4],"k":2},{"nums":[],"k":3}],
    solve: (input) => {
    const { nums, k } = input
    if (!nums.length || k <= 0) return []
    const dq = []
    const out = []
    for (let i = 0; i < nums.length; i++) {
      while (dq.length && dq[0] <= i - k) dq.shift()
      while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop()
      dq.push(i)
      if (i >= k - 1) out.push(nums[dq[0]])
    }
    return out
  },
  },
  {
    seedKey: "postfix-eval-rpn",
    title: "Postfix Eval RPN",
    statement: "## Postfix Eval RPN\n\nEvaluate Reverse Polish Notation tokens in `tokens` (integers as strings, operators + - * /). Division truncates toward zero.\n\n**Input:** `{ \"tokens\": string[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["stack","math"],
    samples: [{"tokens":["2","1","+","3","*"]},{"tokens":["4","13","5","/","+"]}],
    hiddens: [{"tokens":["10","6","9","3","+","-11","*","/","*","17","+","5","+"]},{"tokens":["3"]},{"tokens":["4","2","/"]},{"tokens":["5","1","2","+","4","*","+","3","-"]}],
    solve: (input) => {
    const st = []
    for (const t of input.tokens) {
      if (t === "+" || t === "-" || t === "*" || t === "/") {
        const b = st.pop()
        const a = st.pop()
        let v
        if (t === "+") v = a + b
        else if (t === "-") v = a - b
        else if (t === "*") v = a * b
        else v = (a / b) | 0
        st.push(v)
      } else st.push(Number(t))
    }
    return st[0]
  },
  },
  {
    seedKey: "nest-decode-string",
    title: "Nest Decode String",
    statement: "## Nest Decode String\n\nDecode encoded string `s` of form `k[encoded]` where nested encodings are allowed.\n\n**Input:** `{ \"s\": string }`\n\n**Output:** string\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["string","stack"],
    samples: [{"s":"3[a]2[bc]"},{"s":"2[abc]3[cd]ef"}],
    hiddens: [{"s":"abc"},{"s":"3[a2[c]]"},{"s":"2[2[b]]"},{"s":""}],
    solve: (input) => {
    const countSt = []
    const strSt = []
    let cur = ""
    let num = 0
    for (const c of input.s) {
      if (c >= "0" && c <= "9") num = num * 10 + Number(c)
      else if (c === "[") {
        countSt.push(num)
        strSt.push(cur)
        num = 0
        cur = ""
      } else if (c === "]") {
        const times = countSt.pop()
        cur = strSt.pop() + cur.repeat(times)
      } else cur += c
    }
    return cur
  },
  },
  {
    seedKey: "asteroid-collision-field",
    title: "Asteroid Collision Field",
    statement: "## Asteroid Collision Field\n\n`asts` are asteroids on a line; positive = right, negative = left, magnitude = size. Same-direction never collide; opposite may. Larger survives; equal both explode. Return remaining asteroids.\n\n**Input:** `{ \"asts\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["array","stack","simulation"],
    samples: [{"asts":[5,10,-5]},{"asts":[8,-8]}],
    hiddens: [{"asts":[10,2,-5]},{"asts":[-2,-1,1,2]},{"asts":[]},{"asts":[1,-2,-2,-2]}],
    solve: (input) => {
    const st = []
    for (const a of input.asts) {
      let alive = true
      while (alive && st.length && st[st.length - 1] > 0 && a < 0) {
        const top = st[st.length - 1]
        if (top < -a) {
          st.pop()
          continue
        } else if (top === -a) st.pop()
        alive = false
      }
      if (alive) st.push(a)
    }
    return st
  },
  },

  // --- Linked list ---
  {
    seedKey: "chain-reverse-list",
    title: "Chain Reverse List",
    statement: "## Chain Reverse List\n\nA singly linked list is given as array `nodes` of `{val, next}` where `next` is the next index or null. `head` is the start index (or null). Return the reversed list in the same representation with new head 0..n-1 remapped densely from the reverse order (as array of vals is OK): return array of values from new head to tail.\n\n**Input:** `{ \"vals\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["linked-list"],
    samples: [{"vals":[1,2,3,4,5]},{"vals":[1,2]}],
    hiddens: [{"vals":[]},{"vals":[1]},{"vals":[5,4,3]},{"vals":[0,0,1]}],
    solve: (input) => [...input.vals].reverse(),
  },
  {
    seedKey: "chain-merge-sorted",
    title: "Chain Merge Sorted",
    statement: "## Chain Merge Sorted\n\nMerge two sorted linked lists given as value arrays `a` and `b` into one sorted value array.\n\n**Input:** `{ \"a\": number[], \"b\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Chain Detect Cycle Index\n\n`next` is an array where `next[i]` is the next node index from i, or -1. Return the index where a cycle begins, or -1 if none. List starts at 0.\n\n**Input:** `{ \"next\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Chain Remove Nth From End\n\nGiven linked list values `vals`, remove the `n`-th node from the end and return the resulting value array.\n\n**Input:** `{ \"vals\": number[], \"n\": number }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Chain Add Two Numbers\n\nDigits of two numbers are stored in reverse order as arrays `a` and `b`. Return their sum as digits in reverse order.\n\n**Input:** `{ \"a\": number[], \"b\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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

  // --- Trees / BST ---
  {
    seedKey: "arbor-max-depth",
    title: "Arbor Max Depth",
    statement: "## Arbor Max Depth\n\nBinary tree as nested objects `{val,left,right}` (null children omitted or null). Return maximum depth. Null tree → 0.\n\n**Input:** `{ \"root\": object|null }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["tree","dfs","recursion"],
    samples: [{"root":{"val":3,"left":{"val":9},"right":{"val":20,"left":{"val":15},"right":{"val":7}}}},{"root":null}],
    hiddens: [{"root":{"val":1}},{"root":{"val":1,"left":{"val":2,"left":{"val":3}}}},{"root":{"val":1,"right":{"val":2}}},{"root":{"val":0,"left":null,"right":null}}],
    solve: (input) => {
    const dfs = (node) => (node ? 1 + Math.max(dfs(node.left), dfs(node.right)) : 0)
    return dfs(input.root)
  },
  },
  {
    seedKey: "arbor-invert-tree",
    title: "Arbor Invert Tree",
    statement: "## Arbor Invert Tree\n\nInvert a binary tree (swap left/right recursively). Return the inverted tree object.\n\n**Input:** `{ \"root\": object|null }`\n\n**Output:** object|null\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["tree","dfs","recursion"],
    samples: [{"root":{"val":4,"left":{"val":2,"left":{"val":1},"right":{"val":3}},"right":{"val":7,"left":{"val":6},"right":{"val":9}}}},{"root":null}],
    hiddens: [{"root":{"val":1}},{"root":{"val":1,"left":{"val":2}}},{"root":{"val":2,"left":{"val":1},"right":{"val":3}}},{"root":{"val":1,"right":{"val":2,"right":{"val":3}}}}],
    solve: (input) => {
    const invert = (node) => {
      if (!node) return null
      return { val: node.val, left: invert(node.right), right: invert(node.left) }
    }
    return invert(input.root)
  },
  },
  {
    seedKey: "arbor-same-tree",
    title: "Arbor Same Tree",
    statement: "## Arbor Same Tree\n\nReturn true if trees `p` and `q` are structurally identical with same values.\n\n**Input:** `{ \"p\": object|null, \"q\": object|null }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["tree","dfs"],
    samples: [{"p":{"val":1,"left":{"val":2},"right":{"val":3}},"q":{"val":1,"left":{"val":2},"right":{"val":3}}},{"p":{"val":1,"left":{"val":2}},"q":{"val":1,"right":{"val":2}}}],
    hiddens: [{"p":null,"q":null},{"p":{"val":1},"q":null},{"p":{"val":1},"q":{"val":1}},{"p":{"val":1,"left":{"val":2,"left":{"val":3}}},"q":{"val":1,"left":{"val":2,"left":{"val":3}}}}],
    solve: (input) => {
    const same = (a, b) => {
      if (!a && !b) return true
      if (!a || !b || a.val !== b.val) return false
      return same(a.left, b.left) && same(a.right, b.right)
    }
    return same(input.p, input.q)
  },
  },
  {
    seedKey: "arbor-level-order",
    title: "Arbor Level Order",
    statement: "## Arbor Level Order\n\nReturn level-order traversal of tree `root` as an array of levels (each level an array of values left-to-right).\n\n**Input:** `{ \"root\": object|null }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["tree","bfs","queue"],
    samples: [{"root":{"val":3,"left":{"val":9},"right":{"val":20,"left":{"val":15},"right":{"val":7}}}},{"root":{"val":1}}],
    hiddens: [{"root":null},{"root":{"val":1,"left":{"val":2,"left":{"val":3}}}},{"root":{"val":1,"right":{"val":2,"right":{"val":3}}}},{"root":{"val":5,"left":{"val":4},"right":{"val":6}}}],
    solve: (input) => {
    if (!input.root) return []
    const out = []
    const q = [input.root]
    while (q.length) {
      const size = q.length
      const level = []
      for (let i = 0; i < size; i++) {
        const node = q.shift()
        level.push(node.val)
        if (node.left) q.push(node.left)
        if (node.right) q.push(node.right)
      }
      out.push(level)
    }
    return out
  },
  },
  {
    seedKey: "arbor-is-bst",
    title: "Arbor Is Valid BST",
    statement: "## Arbor Is Valid BST\n\nReturn true if `root` is a valid binary search tree (strictly increasing in-order).\n\n**Input:** `{ \"root\": object|null }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["tree","bst","dfs"],
    samples: [{"root":{"val":2,"left":{"val":1},"right":{"val":3}}},{"root":{"val":5,"left":{"val":1},"right":{"val":4,"left":{"val":3},"right":{"val":6}}}}],
    hiddens: [{"root":null},{"root":{"val":1}},{"root":{"val":5,"left":{"val":4},"right":{"val":6,"left":{"val":3},"right":{"val":7}}}},{"root":{"val":2,"left":{"val":2}}}],
    solve: (input) => {
    const ok = (node, lo, hi) => {
      if (!node) return true
      if (node.val <= lo || node.val >= hi) return false
      return ok(node.left, lo, node.val) && ok(node.right, node.val, hi)
    }
    return ok(input.root, -Infinity, Infinity)
  },
  },
  {
    seedKey: "arbor-lca-bst",
    title: "Arbor LCA In BST",
    statement: "## Arbor LCA In BST\n\nGiven BST `root` and values `p` and `q` present in the tree, return the value of their lowest common ancestor.\n\n**Input:** `{ \"root\": object, \"p\": number, \"q\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["tree","bst"],
    samples: [{"root":{"val":6,"left":{"val":2,"left":{"val":0},"right":{"val":4,"left":{"val":3},"right":{"val":5}}},"right":{"val":8,"left":{"val":7},"right":{"val":9}}},"p":2,"q":8},{"root":{"val":6,"left":{"val":2,"left":{"val":0},"right":{"val":4}},"right":{"val":8}},"p":2,"q":4}],
    hiddens: [{"root":{"val":2,"left":{"val":1}},"p":2,"q":1},{"root":{"val":3,"left":{"val":1,"right":{"val":2}},"right":{"val":4}},"p":1,"q":4},{"root":{"val":5,"left":{"val":3},"right":{"val":7}},"p":3,"q":7},{"root":{"val":2,"right":{"val":3}},"p":3,"q":2}],
    solve: (input) => {
    let node = input.root
    const p = input.p
    const q = input.q
    while (node) {
      if (p < node.val && q < node.val) node = node.left
      else if (p > node.val && q > node.val) node = node.right
      else return node.val
    }
    return null
  },
  },
  {
    seedKey: "arbor-path-sum",
    title: "Arbor Root Path Sum",
    statement: "## Arbor Root Path Sum\n\nReturn true if the tree has a root-to-leaf path summing to `target`.\n\n**Input:** `{ \"root\": object|null, \"target\": number }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["tree","dfs","recursion"],
    samples: [{"root":{"val":5,"left":{"val":4,"left":{"val":11,"left":{"val":7},"right":{"val":2}}},"right":{"val":8,"left":{"val":13},"right":{"val":4,"right":{"val":1}}}},"target":22},{"root":{"val":1,"left":{"val":2},"right":{"val":3}},"target":5}],
    hiddens: [{"root":null,"target":0},{"root":{"val":1},"target":1},{"root":{"val":1,"left":{"val":2}},"target":1},{"root":{"val":-2,"right":{"val":-3}},"target":-5}],
    solve: (input) => {
    const dfs = (node, remain) => {
      if (!node) return false
      if (!node.left && !node.right) return remain === node.val
      return dfs(node.left, remain - node.val) || dfs(node.right, remain - node.val)
    }
    return dfs(input.root, input.target)
  },
  },
  {
    seedKey: "arbor-diameter",
    title: "Arbor Diameter Length",
    statement: "## Arbor Diameter Length\n\nReturn the length (number of edges) of the diameter of binary tree `root`.\n\n**Input:** `{ \"root\": object|null }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["tree","dfs"],
    samples: [{"root":{"val":1,"left":{"val":2,"left":{"val":4},"right":{"val":5}},"right":{"val":3}}},{"root":{"val":1,"left":{"val":2}}}],
    hiddens: [{"root":null},{"root":{"val":1}},{"root":{"val":1,"left":{"val":2,"left":{"val":3,"left":{"val":4}}}}},{"root":{"val":1,"right":{"val":2,"right":{"val":3}}}}],
    solve: (input) => {
    let best = 0
    const depth = (node) => {
      if (!node) return 0
      const L = depth(node.left)
      const R = depth(node.right)
      best = Math.max(best, L + R)
      return 1 + Math.max(L, R)
    }
    depth(input.root)
    return best
  },
  },
  {
    seedKey: "arbor-serialize-preorder",
    title: "Arbor Flatten Preorder Marks",
    statement: "## Arbor Flatten Preorder Marks\n\nSerialize tree `root` to a preorder array using numbers and null markers (`null`). Then the judge only needs the serialized array returned.\n\n**Input:** `{ \"root\": object|null }`\n\n**Output:** (number|null)[]\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["tree","dfs"],
    samples: [{"root":{"val":1,"left":{"val":2},"right":{"val":3,"left":{"val":4},"right":{"val":5}}}},{"root":null}],
    hiddens: [{"root":{"val":1}},{"root":{"val":1,"left":{"val":2,"left":{"val":3}}}},{"root":{"val":1,"right":{"val":2}}},{"root":{"val":5,"left":{"val":3,"right":{"val":4}},"right":{"val":7}}}],
    solve: (input) => {
    const out = []
    const dfs = (node) => {
      if (!node) {
        out.push(null)
        return
      }
      out.push(node.val)
      dfs(node.left)
      dfs(node.right)
    }
    dfs(input.root)
    return out
  },
  },
  {
    seedKey: "arbor-build-from-pre-in",
    title: "Arbor Build From Pre/In",
    statement: "## Arbor Build From Pre/In\n\nConstruct binary tree from `preorder` and `inorder` traversals (unique values). Return nested tree object.\n\n**Input:** `{ \"preorder\": number[], \"inorder\": number[] }`\n\n**Output:** object|null\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["tree","hash-map","recursion"],
    samples: [{"preorder":[3,9,20,15,7],"inorder":[9,3,15,20,7]},{"preorder":[-1],"inorder":[-1]}],
    hiddens: [{"preorder":[],"inorder":[]},{"preorder":[1,2,3],"inorder":[3,2,1]},{"preorder":[1,2,3],"inorder":[1,2,3]},{"preorder":[1,2,4,5,3],"inorder":[4,2,5,1,3]}],
    solve: (input) => {
    const index = new Map(input.inorder.map((v, i) => [v, i]))
    let pi = 0
    const build = (lo, hi) => {
      if (lo > hi) return null
      const val = input.preorder[pi++]
      const mid = index.get(val)
      return { val, left: build(lo, mid - 1), right: build(mid + 1, hi) }
    }
    if (!input.preorder.length) return null
    return build(0, input.inorder.length - 1)
  },
  },

  // --- Graphs ---
  {
    seedKey: "graph-shortest-hops",
    title: "Graph Shortest Hops",
    statement: "## Graph Shortest Hops\n\nUndirected graph with nodes `0..n-1` and `edges` as `[u,v]` pairs. Return shortest hop distance from `src` to `dst`, or -1 if unreachable.\n\n**Input:** `{ \"n\": number, \"edges\": number[][], \"src\": number, \"dst\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["graph","bfs"],
    samples: [{"n":4,"edges":[[0,1],[1,2],[2,3]],"src":0,"dst":3},{"n":3,"edges":[[0,1]],"src":0,"dst":2}],
    hiddens: [{"n":1,"edges":[],"src":0,"dst":0},{"n":5,"edges":[[0,1],[0,2],[1,3],[2,3],[3,4]],"src":0,"dst":4},{"n":2,"edges":[],"src":0,"dst":1},{"n":4,"edges":[[0,1],[1,0],[2,3]],"src":0,"dst":3}],
    solve: (input) => {
    const g = Array.from({ length: input.n }, () => [])
    for (const [u, v] of input.edges) {
      g[u].push(v)
      g[v].push(u)
    }
    const dist = Array(input.n).fill(-1)
    dist[input.src] = 0
    const q = [input.src]
    while (q.length) {
      const u = q.shift()
      if (u === input.dst) return dist[u]
      for (const v of g[u]) {
        if (dist[v] === -1) {
          dist[v] = dist[u] + 1
          q.push(v)
        }
      }
    }
    return -1
  },
  },
  {
    seedKey: "graph-detect-cycle-directed",
    title: "Graph Directed Cycle Probe",
    statement: "## Graph Directed Cycle Probe\n\nDirected graph `0..n-1` with `edges`. Return true if a cycle exists.\n\n**Input:** `{ \"n\": number, \"edges\": number[][] }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["graph","dfs"],
    samples: [{"n":3,"edges":[[0,1],[1,2],[2,0]]},{"n":3,"edges":[[0,1],[1,2]]}],
    hiddens: [{"n":1,"edges":[]},{"n":2,"edges":[[0,1],[1,0]]},{"n":4,"edges":[[0,1],[1,2],[2,3],[3,1]]},{"n":3,"edges":[[0,0]]}],
    solve: (input) => {
    const g = Array.from({ length: input.n }, () => [])
    for (const [u, v] of input.edges) g[u].push(v)
    const state = Array(input.n).fill(0)
    const dfs = (u) => {
      state[u] = 1
      for (const v of g[u]) {
        if (state[v] === 1) return true
        if (state[v] === 0 && dfs(v)) return true
      }
      state[u] = 2
      return false
    }
    for (let i = 0; i < input.n; i++) if (state[i] === 0 && dfs(i)) return true
    return false
  },
  },
  {
    seedKey: "graph-connected-components",
    title: "Graph Component Census",
    statement: "## Graph Component Census\n\nUndirected graph `0..n-1`. Return the number of connected components.\n\n**Input:** `{ \"n\": number, \"edges\": number[][] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["graph","union-find","dfs"],
    samples: [{"n":5,"edges":[[0,1],[1,2],[3,4]]},{"n":3,"edges":[]}],
    hiddens: [{"n":1,"edges":[]},{"n":4,"edges":[[0,1],[1,2],[2,3]]},{"n":4,"edges":[[0,0]]},{"n":6,"edges":[[0,1],[2,3],[4,5],[1,2]]}],
    solve: (input) => {
    const parent = Array.from({ length: input.n }, (_, i) => i)
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])))
    for (const [u, v] of input.edges) {
      const a = find(u)
      const b = find(v)
      if (a !== b) parent[a] = b
    }
    const set = new Set()
    for (let i = 0; i < input.n; i++) set.add(find(i))
    return set.size
  },
  },
  {
    seedKey: "graph-topo-course-order",
    title: "Graph Course Order Wire",
    statement: "## Graph Course Order Wire\n\n`prereqs` are `[course, prereq]` directed edges meaning prereq → course. Return any valid topological order of courses `0..n-1`, or empty array if impossible.\n\n**Input:** `{ \"n\": number, \"prereqs\": number[][] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["graph","topological-sort","bfs"],
    samples: [{"n":2,"prereqs":[[1,0]]},{"n":4,"prereqs":[[1,0],[2,0],[3,1],[3,2]]}],
    hiddens: [{"n":1,"prereqs":[]},{"n":2,"prereqs":[[0,1],[1,0]]},{"n":3,"prereqs":[]},{"n":3,"prereqs":[[0,1],[0,2]]}],
    solve: (input) => {
    const g = Array.from({ length: input.n }, () => [])
    const indeg = Array(input.n).fill(0)
    for (const [c, p] of input.prereqs) {
      g[p].push(c)
      indeg[c]++
    }
    const q = []
    for (let i = 0; i < input.n; i++) if (indeg[i] === 0) q.push(i)
    const order = []
    while (q.length) {
      const u = q.shift()
      order.push(u)
      for (const v of g[u]) {
        indeg[v]--
        if (indeg[v] === 0) q.push(v)
      }
    }
    return order.length === input.n ? order : []
  },
  },
  {
    seedKey: "graph-clone-adj",
    title: "Graph Clone Adjacency",
    statement: "## Graph Clone Adjacency\n\nGiven adjacency list `adj` (array of neighbor arrays for nodes 0..n-1), return a deep-cloned adjacency list (new arrays).\n\n**Input:** `{ \"adj\": number[][] }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["graph","hash-map"],
    samples: [{"adj":[[1,2],[0],[0]]},{"adj":[[]]}],
    hiddens: [{"adj":[]},{"adj":[[1],[0,2],[1]]},{"adj":[[0]]},{"adj":[[1,2,3],[0],[0],[0]]}],
    solve: (input) => input.adj.map((row) => [...row]),
  },
  {
    seedKey: "graph-pacific-reach",
    title: "Graph Ridge Dual Ocean",
    statement: "## Graph Ridge Dual Ocean\n\nMatrix `heights`: water can flow to equal/lower neighbors. Return all coordinates `[r,c]` that can reach both top/left border (Pacific) and bottom/right border (Atlantic).\n\n**Input:** `{ \"heights\": number[][] }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["matrix","dfs","bfs","graph"],
    samples: [{"heights":[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]},{"heights":[[1]]}],
    hiddens: [{"heights":[[1,2],[4,3]]},{"heights":[[2,1],[1,2]]},{"heights":[[3,3,3],[3,1,3],[0,2,4]]},{"heights":[[10,10],[10,10]]}],
    solve: (input) => {
    const h = input.heights
    const m = h.length
    const n = h[0].length
    const pac = Array.from({ length: m }, () => Array(n).fill(false))
    const atl = Array.from({ length: m }, () => Array(n).fill(false))
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
    const dfs = (r, c, seen) => {
      seen[r][c] = true
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr][nc] || h[nr][nc] < h[r][c]) continue
        dfs(nr, nc, seen)
      }
    }
    for (let i = 0; i < m; i++) {
      dfs(i, 0, pac)
      dfs(i, n - 1, atl)
    }
    for (let j = 0; j < n; j++) {
      dfs(0, j, pac)
      dfs(m - 1, j, atl)
    }
    const out = []
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (pac[i][j] && atl[i][j]) out.push([i, j])
    return out
  },
  },
  {
    seedKey: "graph-word-ladder-len",
    title: "Graph Lexicon Ladder Length",
    statement: "## Graph Lexicon Ladder Length\n\nReturn length of shortest transformation sequence from `begin` to `end` using words in `wordList` (change one letter at a time, each intermediate in list). Include begin. Return 0 if impossible.\n\n**Input:** `{ \"begin\": string, \"end\": string, \"wordList\": string[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["graph","bfs","string","hash-set"],
    samples: [{"begin":"hit","end":"cog","wordList":["hot","dot","dog","lot","log","cog"]},{"begin":"hit","end":"cog","wordList":["hot","dot","dog","lot","log"]}],
    hiddens: [{"begin":"a","end":"c","wordList":["a","b","c"]},{"begin":"hot","end":"dog","wordList":["hot","dog"]},{"begin":"lose","end":"code","wordList":["lose","code","lode","robe","rode"]},{"begin":"a","end":"a","wordList":["a"]}],
    solve: (input) => {
    const set = new Set(input.wordList)
    if (!set.has(input.end)) return 0
    const q = [[input.begin, 1]]
    const seen = new Set([input.begin])
    while (q.length) {
      const [w, d] = q.shift()
      if (w === input.end) return d
      const arr = [...w]
      for (let i = 0; i < arr.length; i++) {
        const orig = arr[i]
        for (let c = 97; c <= 122; c++) {
          arr[i] = String.fromCharCode(c)
          const nw = arr.join("")
          if (set.has(nw) && !seen.has(nw)) {
            seen.add(nw)
            q.push([nw, d + 1])
          }
        }
        arr[i] = orig
      }
    }
    return 0
  },
  },
  {
    seedKey: "graph-network-delay",
    title: "Graph Network Delay Time",
    statement: "## Graph Network Delay Time\n\nDirected weighted edges `times` as `[u,v,w]` (1-indexed nodes). Signal from `k`. Return time for all nodes to receive, or -1.\n\n**Input:** `{ \"n\": number, \"times\": number[][], \"k\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["graph","heap"],
    samples: [{"n":2,"times":[[1,2,1]],"k":1},{"n":2,"times":[[1,2,1]],"k":2}],
    hiddens: [{"n":3,"times":[[2,1,1],[2,3,1],[3,1,1]],"k":2},{"n":1,"times":[],"k":1},{"n":4,"times":[[1,2,1],[2,3,2],[1,3,4]],"k":1},{"n":3,"times":[[1,2,1]],"k":2}],
    solve: (input) => {
    const g = Array.from({ length: input.n + 1 }, () => [])
    for (const [u, v, w] of input.times) g[u].push([v, w])
    const dist = Array(input.n + 1).fill(Infinity)
    dist[input.k] = 0
    const pq = [[0, input.k]]
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0])
      const [d, u] = pq.shift()
      if (d !== dist[u]) continue
      for (const [v, w] of g[u]) {
        if (dist[v] > d + w) {
          dist[v] = d + w
          pq.push([dist[v], v])
        }
      }
    }
    let ans = 0
    for (let i = 1; i <= input.n; i++) {
      if (dist[i] === Infinity) return -1
      ans = Math.max(ans, dist[i])
    }
    return ans
  },
  },
  {
    seedKey: "graph-island-perimeter",
    title: "Graph Island Perimeter",
    statement: "## Graph Island Perimeter\n\n`grid` of 0/1 has exactly one island. Return its perimeter.\n\n**Input:** `{ \"grid\": number[][] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["matrix","graph"],
    samples: [{"grid":[[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]},{"grid":[[1]]}],
    hiddens: [{"grid":[[1,0]]},{"grid":[[1,1],[1,1]]},{"grid":[[1,1,1]]},{"grid":[[0,0],[0,1]]}],
    solve: (input) => {
    let p = 0
    const g = input.grid
    const m = g.length
    const n = g[0].length
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (!g[i][j]) continue
        p += 4
        if (i > 0 && g[i - 1][j]) p -= 2
        if (j > 0 && g[i][j - 1]) p -= 2
      }
    }
    return p
  },
  },
  {
    seedKey: "graph-num-islands",
    title: "Graph Flood Island Count",
    statement: "## Graph Flood Island Count\n\nGrid of `'1'` land and `'0'` water. Return number of islands (4-connected).\n\n**Input:** `{ \"grid\": string[][] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["matrix","dfs","bfs"],
    samples: [{"grid":[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]},{"grid":[["1"]]}],
    hiddens: [{"grid":[["0"]]},{"grid":[["1","0","1"],["0","1","0"],["1","0","1"]]},{"grid":[]},{"grid":[["1","1","1"],["0","1","0"],["1","1","1"]]}],
    solve: (input) => {
    const grid = input.grid.map((r) => [...r])
    if (!grid.length) return 0
    const m = grid.length
    const n = grid[0].length
    const dfs = (i, j) => {
      if (i < 0 || j < 0 || i >= m || j >= n || grid[i][j] !== "1") return
      grid[i][j] = "0"
      dfs(i + 1, j)
      dfs(i - 1, j)
      dfs(i, j + 1)
      dfs(i, j - 1)
    }
    let count = 0
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++)
        if (grid[i][j] === "1") {
          count++
          dfs(i, j)
        }
    return count
  },
  },

  // --- Matrix ---
  {
    seedKey: "matrix-spiral-unwind",
    title: "Matrix Spiral Unwind",
    statement: "## Matrix Spiral Unwind\n\nReturn elements of `matrix` in spiral order starting top-left going right.\n\n**Input:** `{ \"matrix\": number[][] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["matrix","simulation"],
    samples: [{"matrix":[[1,2,3],[4,5,6],[7,8,9]]},{"matrix":[[1]]}],
    hiddens: [{"matrix":[]},{"matrix":[[1,2,3,4]]},{"matrix":[[1],[2],[3]]},{"matrix":[[1,2],[3,4]]}],
    solve: (input) => {
    const mat = input.matrix
    if (!mat.length) return []
    let top = 0
    let bottom = mat.length - 1
    let left = 0
    let right = mat[0].length - 1
    const out = []
    while (top <= bottom && left <= right) {
      for (let j = left; j <= right; j++) out.push(mat[top][j])
      top++
      for (let i = top; i <= bottom; i++) out.push(mat[i][right])
      right--
      if (top <= bottom) {
        for (let j = right; j >= left; j--) out.push(mat[bottom][j])
        bottom--
      }
      if (left <= right) {
        for (let i = bottom; i >= top; i--) out.push(mat[i][left])
        left++
      }
    }
    return out
  },
  },
  {
    seedKey: "matrix-rotate-90",
    title: "Matrix Rotate Clockwise",
    statement: "## Matrix Rotate Clockwise\n\nRotate square `matrix` 90 degrees clockwise in-place conceptually; return the rotated matrix.\n\n**Input:** `{ \"matrix\": number[][] }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["matrix"],
    samples: [{"matrix":[[1,2,3],[4,5,6],[7,8,9]]},{"matrix":[[1]]}],
    hiddens: [{"matrix":[]},{"matrix":[[1,2],[3,4]]},{"matrix":[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]},{"matrix":[[0,0],[0,0]]}],
    solve: (input) => {
    const m = input.matrix.map((r) => [...r])
    const n = m.length
    for (let i = 0; i < n; i++) for (let j = i; j < n; j++) [m[i][j], m[j][i]] = [m[j][i], m[i][j]]
    for (const row of m) row.reverse()
    return m
  },
  },
  {
    seedKey: "matrix-search-sorted",
    title: "Matrix Sorted Probe",
    statement: "## Matrix Sorted Probe\n\nEach row and column of `matrix` is sorted ascending. Return true if `target` exists.\n\n**Input:** `{ \"matrix\": number[][], \"target\": number }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["matrix","binary-search","two-pointers"],
    samples: [{"matrix":[[1,4,7],[2,5,8],[3,6,9]],"target":5},{"matrix":[[1,4,7],[2,5,8],[3,6,9]],"target":10}],
    hiddens: [{"matrix":[[1]],"target":1},{"matrix":[],"target":1},{"matrix":[[1,2,3],[4,5,6]],"target":4},{"matrix":[[1,3,5],[2,4,6]],"target":0}],
    solve: (input) => {
    const mat = input.matrix
    if (!mat.length) return false
    let r = 0
    let c = mat[0].length - 1
    while (r < mat.length && c >= 0) {
      if (mat[r][c] === input.target) return true
      if (mat[r][c] > input.target) c--
      else r++
    }
    return false
  },
  },
  {
    seedKey: "matrix-set-zeroes",
    title: "Matrix Zero Cross Mark",
    statement: "## Matrix Zero Cross Mark\n\nIf an element is 0, set its entire row and column to 0. Return the resulting matrix.\n\n**Input:** `{ \"matrix\": number[][] }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["matrix","hash-set"],
    samples: [{"matrix":[[1,1,1],[1,0,1],[1,1,1]]},{"matrix":[[0,1]]}],
    hiddens: [{"matrix":[[1]]},{"matrix":[[0,0],[1,1]]},{"matrix":[[1,2,3],[4,5,6]]},{"matrix":[[1,0,3]]}],
    solve: (input) => {
    const m = input.matrix.map((r) => [...r])
    if (!m.length) return m
    const rows = new Set()
    const cols = new Set()
    for (let i = 0; i < m.length; i++)
      for (let j = 0; j < m[0].length; j++)
        if (m[i][j] === 0) {
          rows.add(i)
          cols.add(j)
        }
    for (let i = 0; i < m.length; i++)
      for (let j = 0; j < m[0].length; j++) if (rows.has(i) || cols.has(j)) m[i][j] = 0
    return m
  },
  },
  {
    seedKey: "matrix-max-island-area",
    title: "Matrix Max Island Area",
    statement: "## Matrix Max Island Area\n\nGrid of 0/1. Return the maximum 4-connected island area (number of 1s).\n\n**Input:** `{ \"grid\": number[][] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["matrix","dfs"],
    samples: [{"grid":[[0,0,1,0,0],[0,1,1,1,0],[0,0,1,0,0]]},{"grid":[[0]]}],
    hiddens: [{"grid":[[1]]},{"grid":[[1,1],[1,0]]},{"grid":[]},{"grid":[[1,0,1],[1,0,1],[1,0,1]]}],
    solve: (input) => {
    const g = input.grid.map((r) => [...r])
    if (!g.length) return 0
    const m = g.length
    const n = g[0].length
    const dfs = (i, j) => {
      if (i < 0 || j < 0 || i >= m || j >= n || g[i][j] !== 1) return 0
      g[i][j] = 0
      return 1 + dfs(i + 1, j) + dfs(i - 1, j) + dfs(i, j + 1) + dfs(i, j - 1)
    }
    let best = 0
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (g[i][j] === 1) best = Math.max(best, dfs(i, j))
    return best
  },
  },
  {
    seedKey: "matrix-diagonal-traverse",
    title: "Matrix Diagonal Traverse",
    statement: "## Matrix Diagonal Traverse\n\nReturn elements of `mat` in diagonal order starting at [0,0] going up-right then down-left alternating.\n\n**Input:** `{ \"mat\": number[][] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["matrix","simulation"],
    samples: [{"mat":[[1,2,3],[4,5,6],[7,8,9]]},{"mat":[[1,2],[3,4]]}],
    hiddens: [{"mat":[[1]]},{"mat":[[1,2,3]]},{"mat":[[1],[2],[3]]},{"mat":[]}],
    solve: (input) => {
    const mat = input.mat
    if (!mat.length) return []
    const m = mat.length
    const n = mat[0].length
    const out = []
    for (let s = 0; s < m + n - 1; s++) {
      const group = []
      for (let i = 0; i < m; i++) {
        const j = s - i
        if (j >= 0 && j < n) group.push(mat[i][j])
      }
      if (s % 2 === 0) group.reverse()
      out.push(...group)
    }
    return out
  },
  },

  // --- Intervals ---
  {
    seedKey: "interval-merge-ranges",
    title: "Interval Merge Ranges",
    statement: "## Interval Merge Ranges\n\nMerge overlapping intervals in `intervals` where each is `[start,end]`. Return merged sorted intervals.\n\n**Input:** `{ \"intervals\": number[][] }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["interval","sorting"],
    samples: [{"intervals":[[1,3],[2,6],[8,10],[15,18]]},{"intervals":[[1,4],[4,5]]}],
    hiddens: [{"intervals":[]},{"intervals":[[1,4]]},{"intervals":[[1,4],[0,2],[3,5]]},{"intervals":[[1,10],[2,3],[4,5]]}],
    solve: (input) => {
    const arr = [...input.intervals].sort((a, b) => a[0] - b[0])
    if (!arr.length) return []
    const out = [arr[0].slice()]
    for (let i = 1; i < arr.length; i++) {
      const last = out[out.length - 1]
      if (arr[i][0] <= last[1]) last[1] = Math.max(last[1], arr[i][1])
      else out.push(arr[i].slice())
    }
    return out
  },
  },
  {
    seedKey: "interval-insert-range",
    title: "Interval Insert Range",
    statement: "## Interval Insert Range\n\nInsert `newInterval` into sorted non-overlapping `intervals` and merge if needed. Return result.\n\n**Input:** `{ \"intervals\": number[][], \"newInterval\": number[] }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["interval","array"],
    samples: [{"intervals":[[1,3],[6,9]],"newInterval":[2,5]},{"intervals":[[1,2],[3,5],[6,7],[8,10],[12,16]],"newInterval":[4,8]}],
    hiddens: [{"intervals":[],"newInterval":[5,7]},{"intervals":[[1,5]],"newInterval":[2,3]},{"intervals":[[1,5]],"newInterval":[6,8]},{"intervals":[[3,5],[9,11]],"newInterval":[1,2]}],
    solve: (input) => {
    const out = []
    let [ns, ne] = input.newInterval
    let i = 0
    const intervals = input.intervals
    while (i < intervals.length && intervals[i][1] < ns) out.push(intervals[i++])
    while (i < intervals.length && intervals[i][0] <= ne) {
      ns = Math.min(ns, intervals[i][0])
      ne = Math.max(ne, intervals[i][1])
      i++
    }
    out.push([ns, ne])
    while (i < intervals.length) out.push(intervals[i++])
    return out
  },
  },
  {
    seedKey: "interval-meeting-rooms",
    title: "Interval Room Conflict",
    statement: "## Interval Room Conflict\n\nReturn true if a person can attend all meetings in `intervals` (`[start,end)`), i.e. no overlaps.\n\n**Input:** `{ \"intervals\": number[][] }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["interval","sorting"],
    samples: [{"intervals":[[0,30],[5,10],[15,20]]},{"intervals":[[7,10],[2,4]]}],
    hiddens: [{"intervals":[]},{"intervals":[[1,5]]},{"intervals":[[1,5],[5,10]]},{"intervals":[[1,10],[2,3],[4,5]]}],
    solve: (input) => {
    const arr = [...input.intervals].sort((a, b) => a[0] - b[0])
    for (let i = 1; i < arr.length; i++) if (arr[i][0] < arr[i - 1][1]) return false
    return true
  },
  },
  {
    seedKey: "interval-min-arrows",
    title: "Interval Balloon Arrows",
    statement: "## Interval Balloon Arrows\n\n`points` are balloons `[xstart,xend]`. One arrow at x bursts all covering x. Return min arrows to burst all.\n\n**Input:** `{ \"points\": number[][] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["interval","greedy","sorting"],
    samples: [{"points":[[10,16],[2,8],[1,6],[7,12]]},{"points":[[1,2],[3,4],[5,6],[7,8]]}],
    hiddens: [{"points":[]},{"points":[[1,2]]},{"points":[[1,2],[2,3],[3,4],[4,5]]},{"points":[[1,10],[2,3],[4,5]]}],
    solve: (input) => {
    if (!input.points.length) return 0
    const pts = [...input.points].sort((a, b) => a[1] - b[1])
    let arrows = 1
    let end = pts[0][1]
    for (let i = 1; i < pts.length; i++) {
      if (pts[i][0] > end) {
        arrows++
        end = pts[i][1]
      }
    }
    return arrows
  },
  },

  // --- Binary search ---
  {
    seedKey: "binsearch-first-bad",
    title: "Binsearch First Bad Build",
    statement: "## Binsearch First Bad Build\n\nBuilds `1..n`. `bad` is the first bad build; all after are bad. Return the first bad version (simulate isBad(v) => v >= bad).\n\n**Input:** `{ \"n\": number, \"bad\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Binsearch Insert Position\n\nSorted distinct `nums`. Return index where `target` is or should be inserted.\n\n**Input:** `{ \"nums\": number[], \"target\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Binsearch Rotated Minimum\n\n`nums` was sorted ascending then rotated. Find the minimum element.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Binsearch Ship Capacity\n\nShip packages `weights` in order within `days`. Return minimum ship capacity.\n\n**Input:** `{ \"weights\": number[], \"days\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Binsearch Twin Median\n\nFind median of two sorted arrays `a` and `b`.\n\n**Input:** `{ \"a\": number[], \"b\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Binsearch Koko Pace\n\nPiles `piles`; eat `speed` bananas/hour (ceil pile/speed hours per pile). Finish in `h` hours. Min speed.\n\n**Input:** `{ \"piles\": number[], \"h\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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

  // --- Sliding window / two pointers ---
  {
    seedKey: "window-max-avg-sub",
    title: "Window Max Average Slice",
    statement: "## Window Max Average Slice\n\nFind contiguous subarray of length `k` with maximum average; return that average.\n\n**Input:** `{ \"nums\": number[], \"k\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Window Longest Ones Flip\n\nBinary array `nums`. Flip at most `k` zeros. Return longest consecutive 1s achievable.\n\n**Input:** `{ \"nums\": number[], \"k\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Twin Pointer Triple Zero\n\nReturn all unique triplets in `nums` that sum to 0. Each triplet sorted; overall order by first then second value.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
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
    statement: "## Twin Pointer Rain Trap\n\nElevation map `height`. Compute how much water can be trapped after raining.\n\n**Input:** `{ \"height\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Window Dual Fruit Baskets\n\n`fruits[i]` is fruit type. Collect from a subarray with at most 2 types. Return max number of fruits.\n\n**Input:** `{ \"fruits\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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

  // --- Dynamic programming ---
  {
    seedKey: "dp-climb-stairs",
    title: "DP Stair Pulse Count",
    statement: "## DP Stair Pulse Count\n\nClimb `n` stairs taking 1 or 2 steps. Return number of distinct ways.\n\n**Input:** `{ \"n\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## DP Night Circuit Rob\n\n`nums[i]` is money in house i. Cannot rob adjacent houses. Max money.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## DP Coin Min Count\n\nCoins of amounts in `coins`. Return fewest coins to make `amount`, or -1.\n\n**Input:** `{ \"coins\": number[], \"amount\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## DP Rising Subsequence\n\nReturn length of the longest strictly increasing subsequence in `nums`.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## DP Grid Path Count\n\nRobot on `m x n` grid starts top-left, moves only right/down. Ways to reach bottom-right.\n\n**Input:** `{ \"m\": number, \"n\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## DP Pack Capacity Value\n\n0/1 knapsack: `weights`, `values`, capacity `W`. Max value without exceeding weight.\n\n**Input:** `{ \"weights\": number[], \"values\": number[], \"W\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## DP Lexicon Segment\n\nReturn true if `s` can be segmented into words from `wordDict` (reuse allowed).\n\n**Input:** `{ \"s\": string, \"wordDict\": string[] }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
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
    statement: "## DP Palindrome Substr Count\n\nCount palindromic substrings in `s` (single chars count).\n\n**Input:** `{ \"s\": string }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## DP Jump Reach Gate\n\n`nums[i]` is max jump length from i. Return true if last index is reachable from 0.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
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
    statement: "## DP Pulse Product Peak\n\nReturn the maximum product of any contiguous subarray of `nums` (non-empty).\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## DP Pattern Match Engine\n\nImplement regex match for pattern `p` against `s` supporting `.` and `*` (zero or more of preceding).\n\n**Input:** `{ \"s\": string, \"p\": string }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
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

  // --- Bit manipulation ---
  {
    seedKey: "bit-single-number",
    title: "Bit Lone Pulse",
    statement: "## Bit Lone Pulse\n\nEvery number in `nums` appears twice except one. Return the single one.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["bit-manipulation","array"],
    samples: [{"nums":[2,2,1]},{"nums":[4,1,2,1,2]}],
    hiddens: [{"nums":[1]},{"nums":[0,1,0]},{"nums":[7,3,7]},{"nums":[5,5,9,9,2]}],
    solve: (input) => input.nums.reduce((a, b) => a ^ b, 0),
  },
  {
    seedKey: "bit-hamming-weight",
    title: "Bit Hamming Weight",
    statement: "## Bit Hamming Weight\n\nReturn the number of set bits in unsigned 32-bit integer `n`.\n\n**Input:** `{ \"n\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Bit Reverse Mirror\n\nReverse bits of a 32-bit unsigned integer `n` and return the result as unsigned.\n\n**Input:** `{ \"n\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Bit Range And Collapse\n\nReturn bitwise AND of all numbers in inclusive range `[left, right]`.\n\n**Input:** `{ \"left\": number, \"right\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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

  // --- Math ---
  {
    seedKey: "math-pow-x-n",
    title: "Math Rapid Power",
    statement: "## Math Rapid Power\n\nCompute `x` raised to integer power `n` (may be negative). Return the number.\n\n**Input:** `{ \"x\": number, \"n\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Math Integer Square Root\n\nReturn the floor of the square root of non-negative integer `x`.\n\n**Input:** `{ \"x\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Math Happy Orbit\n\nA happy number ends at 1 when repeatedly replacing by sum of squares of digits. Return whether `n` is happy.\n\n**Input:** `{ \"n\": number }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
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
    statement: "## Math Factorial Trailing Zeros\n\nReturn the number of trailing zeros in `n!`.\n\n**Input:** `{ \"n\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Math Excel Column Title\n\nConvert 1-indexed column number `n` to Excel title (`1→A`, `28→AB`).\n\n**Input:** `{ \"n\": number }`\n\n**Output:** string\n\nImplement `solve(input)`.",
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

  // --- Union-find ---
  {
    seedKey: "uf-accounts-merge",
    title: "UF Account Alias Merge",
    statement: "## UF Account Alias Merge\n\n`accounts` is array of `[name, email...]`. Merge accounts sharing an email. Return `[name, ...sortedEmails]` per merged account, sorted by name then emails.\n\n**Input:** `{ \"accounts\": string[][] }`\n\n**Output:** string[][]\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["union-find","hash-map","string"],
    samples: [{"accounts":[["John","j1@mail.com","j2@mail.com"],["John","j1@mail.com","j3@mail.com"],["Mary","m@mail.com"]]},{"accounts":[["A","a@x.com"],["B","b@x.com"]]}],
    hiddens: [{"accounts":[["Gabe","g1","g2"],["Gabe","g2","g3"]]},{"accounts":[["Solo","s@x.com"]]},{"accounts":[["A","a1","a2"],["A","a3"],["A","a2","a3"]]},{"accounts":[]}],
    solve: (input) => {
    const parent = {}
    const find = (x) => {
      if (parent[x] !== x) parent[x] = find(parent[x])
      return parent[x]
    }
    const unite = (a, b) => {
      parent[find(a)] = find(b)
    }
    const emailName = {}
    for (const acc of input.accounts) {
      const name = acc[0]
      for (let i = 1; i < acc.length; i++) {
        const e = acc[i]
        if (!(e in parent)) parent[e] = e
        emailName[e] = name
        unite(acc[1], e)
      }
    }
    const groups = {}
    for (const e of Object.keys(parent)) {
      const root = find(e)
      if (!groups[root]) groups[root] = []
      groups[root].push(e)
    }
    const out = Object.values(groups).map((emails) => {
      emails.sort()
      return [emailName[emails[0]], ...emails]
    })
    out.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])))
    return out
  },
  },
  {
    seedKey: "uf-redundant-edge",
    title: "UF Redundant Edge Cut",
    statement: "## UF Redundant Edge Cut\n\nTree with `n` nodes labeled 1..n plus one extra edge in `edges`. Return an edge that can be removed to restore a tree (prefer the last such edge in input order).\n\n**Input:** `{ \"edges\": number[][] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["union-find","graph"],
    samples: [{"edges":[[1,2],[1,3],[2,3]]},{"edges":[[1,2],[2,3],[3,4],[1,4],[1,5]]}],
    hiddens: [{"edges":[[1,2],[2,3],[1,3]]},{"edges":[[1,2],[1,3],[1,4],[2,4]]},{"edges":[[2,1],[3,1],[4,2],[1,4]]},{"edges":[[1,2],[2,3],[3,1],[4,5],[5,6],[6,4]]}],
    solve: (input) => {
    const parent = {}
    const find = (x) => {
      if (parent[x] == null) parent[x] = x
      if (parent[x] !== x) parent[x] = find(parent[x])
      return parent[x]
    }
    let ans = []
    for (const [u, v] of input.edges) {
      const a = find(u)
      const b = find(v)
      if (a === b) ans = [u, v]
      else parent[a] = b
    }
    return ans
  },
  },

  // --- Trie / prefix ---
  {
    seedKey: "trie-prefix-matches",
    title: "Trie Prefix Match Count",
    statement: "## Trie Prefix Match Count\n\nGiven `words` and `prefix`, return how many words start with `prefix`.\n\n**Input:** `{ \"words\": string[], \"prefix\": string }`\n\n**Output:** number\n\nImplement `solve(input)`.",
    difficulty: "EASY",
    tags: ["trie","string"],
    samples: [{"words":["apple","app","apron","banana"],"prefix":"ap"},{"words":["hi"],"prefix":"hello"}],
    hiddens: [{"words":[],"prefix":"a"},{"words":["a","ab","abc"],"prefix":""},{"words":["test","testing"],"prefix":"test"},{"words":["HackIT","Hack","IT"],"prefix":"Hack"}],
    solve: (input) => input.words.filter((w) => w.startsWith(input.prefix)).length,
  },
  {
    seedKey: "trie-longest-word-dict",
    title: "Trie Longest Built Word",
    statement: "## Trie Longest Built Word\n\nFrom `words`, return the longest word that can be built one character at a time by other words (prefixes present). Ties → lexicographically smallest. Empty if none.\n\n**Input:** `{ \"words\": string[] }`\n\n**Output:** string\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["trie","hash-set","string"],
    samples: [{"words":["w","wo","wor","worl","world"]},{"words":["a","banana","app","appl","ap","apply","apple"]}],
    hiddens: [{"words":[]},{"words":["a"]},{"words":["b","br","bre","brew","a","al","ale"]},{"words":["m","mo","moc","moch","mocha","l","la","lat","latt","latte"]}],
    solve: (input) => {
    const set = new Set(input.words)
    let best = ""
    for (const w of [...input.words].sort()) {
      let ok = true
      for (let i = 1; i < w.length; i++) {
        if (!set.has(w.slice(0, i))) {
          ok = false
          break
        }
      }
      if (ok && (w.length > best.length || (w.length === best.length && w < best))) best = w
    }
    return best
  },
  },
  {
    seedKey: "trie-replace-words",
    title: "Trie Root Word Replace",
    statement: "## Trie Root Word Replace\n\n`dictionary` holds roots. Replace each word in sentence `sentence` with the shortest root prefix if any. Return the new sentence.\n\n**Input:** `{ \"dictionary\": string[], \"sentence\": string }`\n\n**Output:** string\n\nImplement `solve(input)`.",
    difficulty: "MEDIUM",
    tags: ["trie","string","hash-set"],
    samples: [{"dictionary":["cat","bat","rat"],"sentence":"the cattle was rattled by the battery"},{"dictionary":["a","b","c"],"sentence":"aadsfasf absbs bbab cadsfafs"}],
    hiddens: [{"dictionary":["a"],"sentence":"a aa aaa"},{"dictionary":[],"sentence":"hello world"},{"dictionary":["hel","hello"],"sentence":"hello"},{"dictionary":["catt","cat","bat"],"sentence":"cattle bat"}],
    solve: (input) => {
    const roots = [...input.dictionary].sort((a, b) => a.length - b.length)
    return input.sentence
      .split(" ")
      .map((w) => {
        for (const r of roots) if (w.startsWith(r)) return r
        return w
      })
      .join(" ")
  },
  },

  // --- Backtracking ---
  {
    seedKey: "backtrack-subsets",
    title: "Backtrack Power Set",
    statement: "## Backtrack Power Set\n\nReturn all subsets of distinct `nums`. Order: by increasing size, then lexicographic within size.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
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
    statement: "## Backtrack Full Permute\n\nReturn all permutations of distinct `nums`, sorted lexicographically.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
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
    statement: "## Backtrack Combo Sum\n\nDistinct positive `candidates`. Return all unique combinations that sum to `target` (reuse allowed). Combinations sorted; overall sorted.\n\n**Input:** `{ \"candidates\": number[], \"target\": number }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
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
    statement: "## Backtrack N-Queens Count\n\nReturn the number of distinct solutions to the `n`-queens puzzle.\n\n**Input:** `{ \"n\": number }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Backtrack Paren Forge\n\nGenerate all combinations of `n` pairs of well-formed parentheses, sorted lexicographically.\n\n**Input:** `{ \"n\": number }`\n\n**Output:** string[]\n\nImplement `solve(input)`.",
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

  // --- Heap / greedy / sim / misc ---
  {
    seedKey: "heap-merge-k-lists",
    title: "Heap Merge K Streams",
    statement: "## Heap Merge K Streams\n\nMerge `lists` (array of sorted number arrays) into one sorted array.\n\n**Input:** `{ \"lists\": number[][] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
    difficulty: "HARD",
    tags: ["heap","linked-list","sorting"],
    samples: [{"lists":[[1,4,5],[1,3,4],[2,6]]},{"lists":[]}],
    hiddens: [{"lists":[[]]},{"lists":[[1],[0]]},{"lists":[[1,2,3],[4,5]]},{"lists":[[2],[1],[3],[0]]}],
    solve: (input) => input.lists.flat().sort((a, b) => a - b),
  },
  {
    seedKey: "heap-k-closest-points",
    title: "Heap K Closest Points",
    statement: "## Heap K Closest Points\n\nReturn `k` points from `points` closest to origin. Any order OK among the k.\n\n**Input:** `{ \"points\": number[][], \"k\": number }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
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
    statement: "## Greedy Jump Min Steps\n\n`nums[i]` max jump from i. Return minimum jumps to reach last index. Guaranteed reachable.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Greedy Circuit Fuel\n\nCircular route: `gas[i]` fuel at station i, `cost[i]` to go to next. Return starting index to complete circuit, or -1. Unique if exists.\n\n**Input:** `{ \"gas\": number[], \"cost\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Greedy Cookie Assign\n\nChildren greed `g[i]`, cookies size `s[j]`. Assign at most one cookie per child if size >= greed. Max content children.\n\n**Input:** `{ \"g\": number[], \"s\": number[] }`\n\n**Output:** number\n\nImplement `solve(input)`.",
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
    statement: "## Sim Robot Bound Loop\n\nRobot starts at (0,0) facing north. Instructions `G` go, `L`/`R` turn. Return true if repeating `instructions` forever stays bounded.\n\n**Input:** `{ \"instructions\": string }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
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
    statement: "## Sim Spiral Fill Matrix\n\nGenerate an `n x n` matrix filled with 1..n^2 in spiral order.\n\n**Input:** `{ \"n\": number }`\n\n**Output:** number[][]\n\nImplement `solve(input)`.",
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
    statement: "## Sort Custom Order Key\n\n`order` is a permutation of unique chars. Sort characters of `s` so that relative order matches `order` (chars not in order stay relative / go after). Return sorted string.\n\n**Input:** `{ \"order\": string, \"s\": string }`\n\n**Output:** string\n\nImplement `solve(input)`.",
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
    statement: "## Prefix Range Sum Query\n\nGiven `nums` and queries `[i,j]` inclusive, return array of range sums for each query.\n\n**Input:** `{ \"nums\": number[], \"queries\": number[][] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Prefix Sign Product Mask\n\nReturn an array `ans` where `ans[i]` is 1 if product of all other elements is positive, -1 if negative, 0 if zero.\n\n**Input:** `{ \"nums\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Mono Next Greater Element\n\nFor each value in `nums1` (subset of `nums2`), find the next greater element in `nums2` to its right; -1 if none. Return answers aligned with `nums1`.\n\n**Input:** `{ \"nums1\": number[], \"nums2\": number[] }`\n\n**Output:** number[]\n\nImplement `solve(input)`.",
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
    statement: "## Recursion Subset Sum Exists\n\nReturn true if any subset of `nums` sums to `target`.\n\n**Input:** `{ \"nums\": number[], \"target\": number }`\n\n**Output:** boolean\n\nImplement `solve(input)`.",
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
