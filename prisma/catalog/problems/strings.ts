import type { CatalogProblemDef } from "../types.js"

// Strings
export const stringsProblems: CatalogProblemDef[] = [
  {
    seedKey: "cipher-is-anagram",
    title: "Cipher Is Anagram",
    story:
      "You have two bags of letter tiles, like in a word game.\n\nYou want to know if the two bags hold exactly the same tiles. They must have the same letters, and each letter must show up the same number of times. The order does not matter.\n\nWhen two words use exactly the same letters like this, they are called **anagrams**. Each bag is given as a **string** (a piece of text).",
    params: [
      { name: "s", type: "string", about: "the tiles in the first bag, written as a word." },
      { name: "t", type: "string", about: "the tiles in the second bag, written as a word." },
    ],
    returns: { type: "boolean", about: "`true` if both bags hold exactly the same tiles, otherwise `false`." },
    rules: ["Every character counts, and each one must appear the same number of times in both strings.", "Two empty strings are anagrams of each other.", "Uppercase and lowercase letters are different tiles."],
    examples: [
      { input: { s: "listen", t: "silent" }, why: "Both words use one each of l, i, s, t, e and n, just in a different order, so the answer is true." },
      { input: { s: "rat", t: "car" }, why: "The first bag has a t but the second has a c instead, so the answer is false." },
      { input: { s: "", t: "" }, why: "Both bags are empty, so they hold the same tiles: true." },
    ],
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
    story:
      "A robot reads sentences backwards. Not letter by letter, but **word by word**: the last word comes first and the first word comes last.\n\nThe sentence is a **string** (a piece of text). Sometimes it has extra spaces at the start, at the end, or between words. The robot is tidy, so its answer has no extra spaces at all.",
    params: [{ name: "s", type: "string", about: "the sentence for the robot to read." }],
    returns: { type: "string", about: "the same words in reverse order, joined by single spaces." },
    rules: ["Words are separated by spaces.", "Several spaces in a row count as one gap between words.", "Spaces at the start and end are removed.", "If there are no words at all, return an empty string."],
    examples: [
      { input: { s: "the sky is blue" }, why: "The words are the, sky, is, blue. Backwards they are blue, is, sky, the." },
      { input: { s: "  hello world  " }, why: "Ignore the extra spaces. The words hello, world flip to \"world hello\"." },
      { input: { s: "  " }, why: "There are only spaces and no words, so the answer is an empty string." },
    ],
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
    story:
      "A parrot is learning sounds from a long line of letters. It gets confused if it hears the same letter twice in one go.\n\nFind the longest stretch of letters that sit right next to each other and have **no repeated letter**. This kind of stretch is called a **substring** (a piece of the text with no gaps).\n\nThe letters come as a **string** (a piece of text).",
    params: [{ name: "s", type: "string", about: "the line of letters the parrot hears." }],
    returns: { type: "number", about: "the length of the longest substring with no repeated characters." },
    rules: ["The letters in a substring must be next to each other; you cannot skip any.", "An empty string has answer `0`.", "Any character counts, including spaces and symbols."],
    examples: [
      { input: { s: "abcabcbb" }, why: "\"abc\" has no repeats and is 3 long. Any 4 letters in a row repeat a letter, so the answer is 3." },
      { input: { s: "pwwkew" }, why: "\"wke\" is 3 long with no repeats. \"pwke\" does not count because it skips a letter." },
      { input: { s: "bbbbb" }, why: "Every letter is b, so the best stretch is just one \"b\": the answer is 1." },
    ],
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
    story:
      "A magic mirror only cares about letters and digits. It ignores spaces, commas and other symbols, and it does not care about uppercase or lowercase.\n\nThe mirror checks if a phrase reads the same forwards and backwards. A phrase like that is called a **palindrome**.\n\nThe phrase is a **string** (a piece of text).",
    params: [{ name: "s", type: "string", about: "the phrase shown to the mirror." }],
    returns: { type: "boolean", about: "`true` if the letters and digits read the same both ways, otherwise `false`." },
    rules: ["Only letters `a-z` and digits `0-9` count. Everything else (spaces, punctuation, `_`) is skipped.", "Uppercase and lowercase are treated as the same letter.", "If nothing is left after skipping, the answer is `true`."],
    examples: [
      { input: { s: "A man, a plan, a canal: Panama" }, why: "Keeping only letters gives \"amanaplanacanalpanama\", which reads the same backwards, so true." },
      { input: { s: "race a car" }, why: "Keeping only letters gives \"raceacar\". Backwards it is \"racaecar\", which is different, so false." },
      { input: { s: " " }, why: "After skipping the space nothing is left, and an empty phrase counts as a palindrome: true." },
    ],
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
    story:
      "A bead maker strings beads in a long line. Writing every bead down takes forever, so she uses a shortcut.\n\nFor each group of the same bead in a row, she writes the bead once, then how many there are. If a bead is alone, she writes just the bead with no number.\n\nThe beads come as an **array** (a list in order) of single characters, and the answer is also a list of single characters.",
    params: [{ name: "chars", type: "string[]", about: "the beads in order, one character each." }],
    returns: { type: "string[]", about: "the short version: each bead, followed by its count if the count is more than 1." },
    rules: ["Only beads that are next to each other form a group.", "A count of 1 is not written.", "A count with several digits is split into one character per digit, so 12 becomes `\"1\"`, `\"2\"`.", "An empty list gives an empty list."],
    examples: [
      { input: { chars: ["a", "a", "b", "b", "c", "c", "c"] }, why: "Two a's, two b's and three c's become a, 2, b, 2, c, 3." },
      { input: { chars: ["a", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b"] }, why: "One a is written alone. Twelve b's become b, 1, 2." },
      { input: { chars: ["a"] }, why: "A single bead has count 1, so only the bead is written." },
    ],
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
    story:
      "A teacher has a pile of word cards. She wants to put cards into the same box when they use exactly the same letters, just shuffled. Words like that are called **anagrams**, like \"eat\" and \"tea\".\n\nEach word is a **string** (a piece of text), and you get them as an **array** (a list in order). Hand back the boxes as a list of lists.",
    params: [{ name: "strs", type: "string[]", about: "the word cards, in the order they were picked up." }],
    returns: { type: "string[][]", about: "the boxes, where each box is a list of words that are anagrams of each other." },
    rules: ["Boxes are listed in the order their first word appears in `strs`.", "Inside a box, words keep their original order from `strs`.", "The empty string is a word too and gets its own box.", "An empty list of cards gives an empty list of boxes."],
    examples: [
      { input: { strs: ["eat", "tea", "tan", "ate", "nat", "bat"] }, why: "eat, tea and ate share letters a, e, t. tan and nat share a, n, t. bat is alone. The boxes appear in the order eat, tan, bat were first seen." },
      { input: { strs: ["ab", "ba", "cd"] }, why: "ab and ba use the same letters, so they share a box. cd gets its own box." },
      { input: { strs: [""] }, why: "There is one card with no letters, so there is one box holding it." },
    ],
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
    story:
      "A lighthouse beacon receives text messages, and it needs to pull a **whole number** out of the start of each one.\n\nIt reads from left to right. First it skips any spaces. Then it may see one `+` or `-` sign. Then it reads digits for as long as it can. The moment it sees anything that is not a digit, it stops.\n\nThe beacon's memory is small. It can only store numbers from `-2147483648` up to `2147483647` (that is, -2^31 to 2^31 - 1). A number outside that range is squeezed to the nearest end. The message is a **string** (a piece of text).",
    params: [{ name: "s", type: "string", about: "the message the beacon receives." }],
    returns: { type: "number", about: "the whole number read from the start of the message, kept inside the allowed range." },
    rules: ["Only leading space characters are skipped.", "At most one sign is read; with no sign the number is positive.", "If no digits are found right after the spaces and sign, the answer is `0`.", "Numbers bigger than `2147483647` become `2147483647`; numbers smaller than `-2147483648` become `-2147483648`."],
    examples: [
      { input: { s: "   -42" }, why: "Skip the spaces, read the minus sign, then read 42. The answer is -42." },
      { input: { s: "4193 with words" }, why: "Read 4193, then the space stops the reading. The answer is 4193." },
      { input: { s: "words and 987" }, why: "The first thing after the spaces is the letter w, not a digit or sign, so no number is read: 0." },
    ],
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
    story:
      "Some friends wrote their secret code words on cards. They want to find the longest beginning that **all** the words share.\n\nThat shared beginning is called the **common prefix**. For \"flower\" and \"flow\" it is \"flow\".\n\nEach word is a **string** (a piece of text), and you get them as an **array** (a list in order).",
    params: [{ name: "strs", type: "string[]", about: "the code words on the cards." }],
    returns: { type: "string", about: "the longest beginning that every word starts with." },
    rules: ["If the words share no beginning at all, return an empty string.", "If the list is empty, return an empty string.", "With only one word, the whole word is the answer."],
    examples: [
      { input: { strs: ["flower", "flow", "flight"] }, why: "All three start with \"fl\", but the third letters o, o and i are not all the same. The answer is \"fl\"." },
      { input: { strs: ["dog", "racecar", "car"] }, why: "The first letters d, r and c are already different, so the answer is an empty string." },
      { input: { strs: ["alone"] }, why: "There is only one word, so all of it is shared: \"alone\"." },
    ],
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
    story:
      "You are stacking toy boxes inside each other. There are three kinds of box: round `( )`, square `[ ]` and curly `{ }`. Each box has an opening side and a closing side.\n\nA line of box sides is good when every opening side gets closed by the **same kind** of box, and an inner box is closed before the box around it.\n\nThe box sides come as a **string** (a piece of text).",
    params: [{ name: "s", type: "string", about: "the box sides in order, using only the characters `()[]{}`." }],
    returns: { type: "boolean", about: "`true` if every box is opened and closed correctly, otherwise `false`." },
    rules: ["`s` contains only the characters `()[]{}`.", "A closing side must match the most recent box that is still open.", "Boxes left open at the end make the answer `false`.", "An empty string is fine and gives `true`."],
    examples: [
      { input: { s: "([{}])" }, why: "The curly box closes first, then the square box, then the round box. Each one matches, so true." },
      { input: { s: "(]" }, why: "A round box is opened but a square side tries to close it, so false." },
      { input: { s: "(((" }, why: "Three round boxes are opened and never closed, so false." },
    ],
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
    story:
      "A neon sign plays a talking game. It starts by showing `\"1\"`.\n\nEach next sign reads the previous sign out loud, group by group. For `\"1\"` it says \"one 1\", so the next sign is `\"11\"`. Then it says \"two 1s\", so the next is `\"21\"`. Then \"one 2, one 1\" gives `\"1211\"`.\n\nThis is called the **count-and-say** sequence. Each sign is a **string** (a piece of text).",
    params: [{ name: "n", type: "number", about: "which sign to show, where sign number 1 is `\"1\"`." }],
    returns: { type: "string", about: "the `n`-th sign in the count-and-say sequence." },
    rules: ["Counting starts at 1, so `n = 1` gives `\"1\"`.", "A group is a run of the same digit next to each other. Write the group's size, then the digit."],
    examples: [
      { input: { n: 1 }, why: "The first sign is always \"1\"." },
      { input: { n: 4 }, why: "The signs go 1, 11, 21, 1211. Sign 3 is \"21\": one 2, then one 1, which gives \"1211\"." },
      { input: { n: 5 }, why: "Sign 4 is \"1211\": one 1, one 2, two 1s. That reads as \"111221\"." },
    ],
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
    story:
      "A long ribbon has letters printed on it. You need to cut out a piece that contains every letter on your shopping list.\n\nIf a letter is on the list twice, your piece needs it at least twice. Ribbon is precious, so cut the **shortest** piece that works. The piece must be one unbroken part of the ribbon, called a **substring**.\n\nThe ribbon and the list are both **strings** (pieces of text).",
    params: [
      { name: "s", type: "string", about: "the letters printed on the ribbon, from left to right." },
      { name: "t", type: "string", about: "the shopping list of letters you need." },
    ],
    returns: { type: "string", about: "the shortest piece of `s` that holds every letter of `t`, including repeats." },
    rules: ["If no piece works, return an empty string.", "If `t` is empty, return an empty string.", "Uppercase and lowercase letters are different.", "If several shortest pieces work, return the one that starts furthest to the left."],
    examples: [
      { input: { s: "ADOBECODEBANC", t: "ABC" }, why: "\"BANC\" holds an A, a B and a C and is only 4 long. No shorter piece has all three." },
      { input: { s: "ab", t: "b" }, why: "The piece \"b\" already has everything on the list." },
      { input: { s: "a", t: "aa" }, why: "The list needs two a's but the ribbon only has one, so the answer is an empty string." },
    ],
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
    story:
      "You have a word made of letter magnets on the fridge, and you want to turn it into another word.\n\nIn one move you can **add** a letter, **remove** a letter, or **swap** one letter for a different one. What is the smallest number of moves you need?\n\nThis number is called the **edit distance**. Both words are **strings** (pieces of text).",
    params: [
      { name: "a", type: "string", about: "the word you start with." },
      { name: "b", type: "string", about: "the word you want to end up with." },
    ],
    returns: { type: "number", about: "the fewest moves needed to turn `a` into `b`." },
    rules: ["Each add, remove or swap counts as one move.", "If the words are already the same, the answer is `0`.", "Either word can be empty."],
    examples: [
      { input: { a: "horse", b: "ros" }, why: "Swap h for r (rorse), remove the middle r (rose), remove e (ros). That is 3 moves." },
      { input: { a: "kitten", b: "sitting" }, why: "Swap k for s, swap e for i, then add g at the end. That is 3 moves." },
      { input: { a: "a", b: "" }, why: "Remove the one letter and you are done: 1 move." },
    ],
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
]
