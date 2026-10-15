import type { CatalogProblemDef } from "../types.js"

// Trie / prefix
export const trieProblems: CatalogProblemDef[] = [
  {
    seedKey: "trie-prefix-matches",
    title: "Trie Prefix Match Count",
    story:
      "You are typing in a search box, and the phone wants to guess what word you mean.\n\nYou have typed the first few letters, called the **prefix** (the start of a word). Count how many words in the phone's word list start with exactly those letters.",
    params: [
      { name: "words", type: "string[]", about: "the words the phone knows." },
      { name: "prefix", type: "string", about: "the letters you have typed so far." },
    ],
    returns: { type: "number", about: "how many words in `words` start with `prefix`." },
    rules: ["Uppercase and lowercase letters are different, so `Hack` does not match `hack`.", "A word counts as starting with itself.", "An empty prefix matches every word.", "An empty word list gives `0`."],
    examples: [
      { input: { words: ["apple", "app", "apron", "banana"], prefix: "ap" }, why: "apple, app and apron all start with ap, but banana does not, so the answer is 3." },
      { input: { words: ["hi"], prefix: "hello" }, why: "hi is shorter than hello, so it cannot start with it. The answer is 0." },
      { input: { words: ["a", "ab", "abc"], prefix: "" }, why: "Typing nothing matches every word, so all 3 count." },
    ],
    difficulty: "EASY",
    tags: ["trie","string"],
    samples: [{"words":["apple","app","apron","banana"],"prefix":"ap"},{"words":["hi"],"prefix":"hello"}],
    hiddens: [{"words":[],"prefix":"a"},{"words":["a","ab","abc"],"prefix":""},{"words":["test","testing"],"prefix":"test"},{"words":["HackIT","Hack","IT"],"prefix":"Hack"}],
    solve: (input) => input.words.filter((w) => w.startsWith(input.prefix)).length,
  },
  {
    seedKey: "trie-longest-word-dict",
    title: "Trie Longest Built Word",
    story:
      "You are playing a letter-stacking game. You start with one letter, then add one letter at a time to the end. The catch: after **every** step, what you have so far must be a real word in the game's list.\n\nFor example, with the list w, wo, wor, worl, world you can build world, because w, wo, wor and worl are all in the list.\n\nFind the **longest** word in the list that can be built this way.",
    params: [{ name: "words", type: "string[]", about: "the words allowed in the game." }],
    returns: { type: "string", about: "the longest word that can be built one letter at a time, or an empty string if there is none." },
    rules: ["Every shorter start of the word (all its prefixes) must be in `words`. A one-letter word can always be built.", "If several words tie for longest, return the one that comes first in alphabetical order.", "If the list is empty, return `\"\"`."],
    examples: [
      { input: { words: ["w", "wo", "wor", "worl", "world"] }, why: "w, wo, wor and worl are all in the list, so world can be built and it is the longest." },
      { input: { words: ["a", "banana", "app", "appl", "ap", "apply", "apple"] }, why: "banana cannot be built because b is missing. Both apple and apply can be built with 5 letters, and apple comes first in alphabetical order." },
      { input: { words: [] }, why: "There are no words, so the answer is the empty string." },
    ],
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
    story:
      "A robot is learning to talk and likes to keep words short. It has a list of **roots** (short starting pieces of words, like cat in cattle).\n\nFor each word in a sentence, the robot checks if the word starts with any root. If it does, the robot says just the root instead of the whole word. If several roots fit, it picks the **shortest** one. If none fit, it keeps the word as it is.\n\nReturn the sentence the robot says.",
    params: [
      { name: "dictionary", type: "string[]", about: "the roots the robot knows." },
      { name: "sentence", type: "string", about: "the sentence to shorten, with words separated by single spaces." },
    ],
    returns: { type: "string", about: "the sentence with each word replaced by its shortest matching root, words joined by single spaces." },
    rules: ["A word that starts with no root stays the same.", "If more than one root fits a word, use the shortest.", "A word that is exactly a root also gets replaced (by itself).", "An empty `dictionary` leaves the sentence unchanged."],
    examples: [
      { input: { dictionary: ["cat", "bat", "rat"], sentence: "the cattle was rattled by the battery" }, why: "cattle starts with cat, rattled with rat and battery with bat. The other words match no root and stay the same." },
      { input: { dictionary: ["catt", "cat", "bat"], sentence: "cattle bat" }, why: "cattle starts with both catt and cat, and cat is shorter. bat is itself a root." },
      { input: { dictionary: [], sentence: "hello world" }, why: "There are no roots, so nothing changes." },
    ],
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
]
