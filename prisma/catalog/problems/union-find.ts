import type { CatalogProblemDef } from "../types.js"

// Union-find
export const unionFindProblems: CatalogProblemDef[] = [
  {
    seedKey: "uf-accounts-merge",
    title: "UF Account Alias Merge",
    story:
      "A game website has a messy list of player accounts. Each account is a name followed by one or more email addresses.\n\nSome players made more than one account. If two accounts share **any** email, they belong to the same player and should be **merged** into one. Merging can chain: if account 1 shares an email with account 2, and account 2 shares one with account 3, all three are the same player.\n\nA **union-find** (a way of joining things into groups and quickly asking \"which group is this in?\") is the perfect tool here.",
    params: [{ name: "accounts", type: "string[][]", about: "the accounts. Each one is `[name, email1, email2, ...]`." }],
    returns: { type: "string[][]", about: "one entry per player, written as `[name, ...emails]` with the emails sorted alphabetically." },
    rules: ["Two accounts are the same player only if they share an email. Having the same name is not enough.", "Each email appears only once in a merged account, and the emails are sorted alphabetically.", "Sort the merged accounts by name, and when names tie, by their first email.", "No accounts gives an empty list."],
    examples: [
      { input: { accounts: [["John", "j1@mail.com", "j2@mail.com"], ["John", "j1@mail.com", "j3@mail.com"], ["Mary", "m@mail.com"]] }, why: "Both John accounts share j1@mail.com, so they merge into one with three emails. Mary stays alone." },
      { input: { accounts: [["A", "a1", "a2"], ["A", "a3"], ["A", "a2", "a3"]] }, why: "The third account shares a2 with the first and a3 with the second, so all three join into one account." },
      { input: { accounts: [] }, why: "There are no accounts, so the answer is an empty list." },
    ],
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
    story:
      "A group of islands, numbered `1` to `n`, are connected by bridges. The builders meant to use just enough bridges so every island can reach every other island in exactly one way, with no loops. That shape is called a **tree**.\n\nBut they built **extra bridges**, so now there is at least one loop. Find the loop-making bridge described below.\n\nGo through the bridges in order. A **union-find** (a way of joining things into groups and quickly asking \"which group is this in?\") tells you when a bridge connects two islands that could already reach each other.",
    params: [{ name: "edges", type: "number[][]", about: "the bridges in the order they were built. Each one is `[a, b]`, joining island `a` and island `b`." }],
    returns: { type: "number[]", about: "the bridge `[a, b]` to remove, written exactly as it appears in `edges`." },
    rules: ["Islands are numbered starting from `1`.", "Go through the bridges in order. The answer is the **last** bridge that joins two islands that could already reach each other.", "Some maps have more than one loop; still return only that last loop-making bridge."],
    examples: [
      { input: { edges: [[1, 2], [1, 3], [2, 3]] }, why: "After [1,2] and [1,3], islands 2 and 3 can already reach each other. So [2,3] is the extra bridge." },
      { input: { edges: [[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]] }, why: "Islands 1 to 4 are already joined by the first three bridges, so [1,4] makes a loop and is the answer." },
    ],
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
]
