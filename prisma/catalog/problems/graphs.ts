import type { CatalogProblemDef } from "../types.js"

// Graphs
export const graphsProblems: CatalogProblemDef[] = [
  {
    seedKey: "graph-shortest-hops",
    title: "Graph Shortest Hops",
    story:
      "There are `n` towns, numbered `0` to `n - 1`. Some towns are joined by roads. Roads go both ways.\n\nThis is called a **graph** (dots connected by lines). Each town is a dot, and each road is an **edge** (a line between two dots). A road is written as a pair `[u, v]`, which means towns `u` and `v` are joined.\n\nYou start in town `src` and want to get to town `dst`. Each road you drive along counts as one **hop**. What is the smallest number of hops you need?",
    params: [
      { name: "n", type: "number", about: "how many towns there are." },
      { name: "edges", type: "number[][]", about: "the roads, each written as `[u, v]` joining town `u` and town `v`." },
      { name: "src", type: "number", about: "the town where you start." },
      { name: "dst", type: "number", about: "the town you want to reach." },
    ],
    returns: { type: "number", about: "the smallest number of roads you must drive along to get from `src` to `dst`." },
    rules: [
      "Roads go both ways (the graph is undirected).",
      "Towns are numbered from `0` to `n - 1`.",
      "If there is no way to reach `dst`, return `-1`.",
      "If `src` and `dst` are the same town, the answer is `0`.",
    ],
    examples: [
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]], src: 0, dst: 3 }, why: "The towns form a line: 0 to 1 to 2 to 3. That takes 3 hops." },
      { input: { n: 3, edges: [[0, 1]], src: 0, dst: 2 }, why: "No road touches town 2, so you can never get there. The answer is -1." },
      { input: { n: 1, edges: [], src: 0, dst: 0 }, why: "You are already in the town you want, so you need 0 hops." },
    ],
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
    story:
      "A water park has `n` pools, numbered `0` to `n - 1`. Some pools are joined by slides. A slide only goes **one way**.\n\nThis is a **directed graph** (dots joined by one-way arrows). Each pool is a dot, and each slide is an **edge** (an arrow between two dots). A slide is written as `[u, v]`, which means you can slide from pool `u` down to pool `v`, but not back.\n\nIs there a **cycle**? That means: can you start at some pool, ride slides, and end up back at that same pool?",
    params: [
      { name: "n", type: "number", about: "how many pools there are." },
      { name: "edges", type: "number[][]", about: "the one-way slides, each written as `[u, v]` going from pool `u` to pool `v`." },
    ],
    returns: { type: "boolean", about: "`true` if there is a loop of slides that brings you back where you started, otherwise `false`." },
    rules: [
      "Slides are one-way (the graph is directed).",
      "Pools are numbered from `0` to `n - 1`.",
      "A slide from a pool to itself, like `[2, 2]`, counts as a cycle.",
    ],
    examples: [
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, why: "Slide 0 to 1, 1 to 2, then 2 back to 0. You are home again, so there is a cycle." },
      { input: { n: 3, edges: [[0, 1], [1, 2]] }, why: "You can go 0 to 1 to 2, but no slide ever leads back up. There is no cycle." },
      { input: { n: 3, edges: [[0, 0]] }, why: "The slide from pool 0 lands right back in pool 0, which is a tiny cycle." },
    ],
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
    story:
      "There are `n` kids in a class, numbered `0` to `n - 1`. Some pairs of kids are friends. Friendship goes both ways.\n\nThis is a **graph** (dots connected by lines). Each kid is a dot, and each friendship is an **edge** (a line between two dots), written as `[u, v]`.\n\nKids who are linked by a chain of friends form one **friend group** (a **connected component**). A kid with no friends is a group all alone. How many friend groups are there?",
    params: [
      { name: "n", type: "number", about: "how many kids there are." },
      { name: "edges", type: "number[][]", about: "the friendships, each written as `[u, v]` meaning kid `u` and kid `v` are friends." },
    ],
    returns: { type: "number", about: "how many separate friend groups there are." },
    rules: [
      "Friendships go both ways (the graph is undirected).",
      "Kids are numbered from `0` to `n - 1`.",
      "A kid with no friends counts as a group of one.",
      "A pair like `[2, 2]` (a kid friends with themself) does not join anyone together.",
    ],
    examples: [
      { input: { n: 5, edges: [[0, 1], [1, 2], [3, 4]] }, why: "Kids 0, 1 and 2 are linked in one group, and kids 3 and 4 are another. That is 2 groups." },
      { input: { n: 3, edges: [] }, why: "Nobody is friends with anybody, so each of the 3 kids is a group alone." },
      { input: { n: 4, edges: [[0, 0]] }, why: "The only pair joins kid 0 with themself, which links nobody else. All 4 kids are alone, so there are 4 groups." },
    ],
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
    story:
      "A wizard school has `n` classes, numbered `0` to `n - 1`. Some classes need another class first. You must pass Potions 1 before you can take Potions 2!\n\nEach rule is written as `[course, prereq]`. It means you must finish class `prereq` **before** you take class `course`. You can think of it as a **directed graph** (dots joined by one-way arrows) with an arrow from `prereq` to `course`.\n\nFind an order to take **all** the classes so that every rule is followed. This is called a **topological order**. If the rules go around in a circle, no order works.",
    params: [
      { name: "n", type: "number", about: "how many classes there are." },
      { name: "prereqs", type: "number[][]", about: "the rules, each written as `[course, prereq]` meaning `prereq` must come before `course`." },
    ],
    returns: { type: "number[]", about: "a list of all `n` classes in an order that follows every rule, or an empty list `[]` if that is impossible." },
    rules: [
      "Classes are numbered from `0` to `n - 1`, and every class must appear exactly once.",
      "Watch the order inside each pair: the second number comes first.",
      "The checker expects one exact order. Put every class with no rules in a line, smallest number first. Always take the class at the front of the line. When finishing it makes another class ready, add that class to the back of the line, in the order the rules are listed.",
      "If the rules make a circle (like A needs B and B needs A), return `[]`.",
    ],
    examples: [
      { input: { n: 2, prereqs: [[1, 0]] }, why: "Class 1 needs class 0 first, so take 0 and then 1." },
      { input: { n: 4, prereqs: [[1, 0], [2, 0], [3, 1], [3, 2]] }, why: "Class 0 has no rules, so take it first. Then 1 and 2 are both ready. Class 3 needs both 1 and 2, so it goes last." },
      { input: { n: 2, prereqs: [[0, 1], [1, 0]] }, why: "Class 0 needs 1, and class 1 needs 0. That is a circle, so no order works and the answer is an empty list." },
    ],
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
    story:
      "Your friend drew a map of houses and paths. The houses are numbered `0`, `1`, `2`, and so on.\n\nThe map is written as an **adjacency list** (a list of neighbor lists). Spot `i` holds a list of the houses that house `i` has a path to. For example, `[[1, 2], [0], [0]]` means house 0 connects to houses 1 and 2, and houses 1 and 2 each connect back to house 0.\n\nMake a perfect **copy** of the map using brand new lists, so changing your copy never messes up the original.",
    params: [
      { name: "adj", type: "number[][]", about: "the map: spot `i` is the list of houses next to house `i`." },
    ],
    returns: { type: "number[][]", about: "a new map with exactly the same neighbor lists, in the same order." },
    rules: [
      "The copy must use new lists, not the original ones (a **deep copy**).",
      "Keep every neighbor list in the same order as the original.",
      "An empty map gives an empty map back.",
    ],
    examples: [
      { input: { adj: [[1, 2], [0], [0]] }, why: "Copy each house's list one by one. The copy looks exactly like the original." },
      { input: { adj: [[0]] }, why: "House 0 has a path to itself. The copy keeps that the same." },
      { input: { adj: [] }, why: "There are no houses, so the copy is empty too." },
    ],
    difficulty: "EASY",
    tags: ["graph","hash-map"],
    samples: [{"adj":[[1,2],[0],[0]]},{"adj":[[]]}],
    hiddens: [{"adj":[]},{"adj":[[1],[0,2],[1]]},{"adj":[[0]]},{"adj":[[1,2,3],[0],[0],[0]]}],
    solve: (input) => input.adj.map((row) => [...row]),
  },
  {
    seedKey: "graph-pacific-reach",
    title: "Graph Ridge Dual Ocean",
    story:
      "An island is drawn as a **grid** (rows and columns, like a chessboard). Each square has a number: how high the land is there.\n\nThe **Pacific Ocean** touches the top edge and the left edge of the island. The **Atlantic Ocean** touches the bottom edge and the right edge.\n\nWhen it rains, water can flow from a square to a neighbor up, down, left or right, but only if that neighbor is the **same height or lower**. Water on an edge square can flow right into the ocean next to it.\n\nFind every square where rain can reach **both** oceans.",
    params: [
      { name: "heights", type: "number[][]", about: "the island map, where `heights[r][c]` is how high the land is at row `r`, column `c`." },
    ],
    returns: { type: "number[][]", about: "the `[r, c]` positions of every square whose water can reach both oceans." },
    rules: [
      "Water moves only up, down, left or right, never diagonally.",
      "Water can flow to a neighbor that is equal or lower, never higher.",
      "Rows and columns are counted from `0`.",
      "List the squares row by row from the top, and left to right inside each row.",
      "The grid has at least one row and one column.",
    ],
    examples: [
      { input: { heights: [[1, 2], [4, 3]] }, why: "The 1 in the top-left is lower than both its neighbors, so its water can only go to the Pacific. The 2 and the 4 touch both a Pacific edge and an Atlantic edge, and the 3 can flow to the Atlantic directly or down to the 2 and on to the Pacific." },
      { input: { heights: [[1]] }, why: "The only square touches all four edges, so its water reaches both oceans." },
    ],
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
    story:
      "Let's play a word game! You start with the word `begin` and want to turn it into the word `end`.\n\nEach move, you may change **exactly one letter**. But every new word you make must be in the dictionary `wordList`. For example, `hit` can become `hot` if `hot` is in the list.\n\nThe chain of words from `begin` to `end` is called a **ladder**. How many words are in the shortest ladder? Count `begin` and `end` too.",
    params: [
      { name: "begin", type: "string", about: "the starting word." },
      { name: "end", type: "string", about: "the word you want to reach." },
      { name: "wordList", type: "string[]", about: "the dictionary of words you are allowed to use." },
    ],
    returns: { type: "number", about: "how many words are in the shortest ladder, counting `begin` and `end`, or `0` if there is no ladder." },
    rules: [
      "Each step changes exactly one letter into a lowercase letter `a` to `z`.",
      "Every word after `begin` must be in `wordList`. `begin` itself does not need to be in it.",
      "If `end` is not in `wordList`, there is no ladder, so return `0`.",
      "If there is no way to reach `end`, return `0`.",
    ],
    examples: [
      { input: { begin: "hit", end: "cog", wordList: ["hot", "dot", "dog", "lot", "log", "cog"] }, why: "hit, hot, dot, dog, cog is a ladder of 5 words, and no shorter one exists." },
      { input: { begin: "hit", end: "cog", wordList: ["hot", "dot", "dog", "lot", "log"] }, why: "`cog` is not in the dictionary, so you can never land on it. The answer is 0." },
      { input: { begin: "a", end: "a", wordList: ["a"] }, why: "You are already at the end word, so the ladder is just one word long." },
    ],
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
    story:
      "There are `n` treehouses, numbered `1` to `n`. Kids send messages between them with one-way tin-can phones.\n\nEach phone line is written as `[u, v, w]`. It means a message can go from treehouse `u` to treehouse `v`, and it takes `w` seconds. Lines only work in one direction. This is a **directed weighted graph** (dots joined by one-way arrows, where each arrow has a travel time).\n\nTreehouse `k` sends out a message at time `0`. Messages get passed along as fast as possible. How long until **every** treehouse has heard it?",
    params: [
      { name: "n", type: "number", about: "how many treehouses there are." },
      { name: "times", type: "number[][]", about: "the phone lines, each written as `[u, v, w]`: from `u` to `v` taking `w` seconds." },
      { name: "k", type: "number", about: "the treehouse that sends the message first." },
    ],
    returns: { type: "number", about: "the time when the last treehouse hears the message, or `-1` if some treehouse never hears it." },
    rules: [
      "Treehouses are numbered from `1` to `n` (not from 0).",
      "Phone lines are one-way.",
      "Each treehouse hears the message by the fastest possible path.",
      "If any treehouse can never be reached, return `-1`.",
    ],
    examples: [
      { input: { n: 2, times: [[1, 2, 1]], k: 1 }, why: "Treehouse 1 sends at time 0, and it reaches treehouse 2 after 1 second. Everyone has heard it at time 1." },
      { input: { n: 3, times: [[1, 2, 1], [2, 3, 2], [1, 3, 4]], k: 1 }, why: "Going 1 to 2 to 3 takes 1 + 2 = 3 seconds, which beats the direct line of 4. The last treehouse hears it at time 3." },
      { input: { n: 2, times: [[1, 2, 1]], k: 2 }, why: "The only line goes from 1 to 2, so a message from treehouse 2 can never reach treehouse 1. The answer is -1." },
    ],
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
    story:
      "A treasure map is a **grid** (rows and columns, like a chessboard). Each square is `1` for land or `0` for water.\n\nAll the land squares join together into **one island**. Land squares are joined when they touch up, down, left or right.\n\nYou want to build a fence all the way around the island. Every square side is 1 unit long. How long is the fence? This length is called the **perimeter**.",
    params: [
      { name: "grid", type: "number[][]", about: "the map, where `1` is land and `0` is water." },
    ],
    returns: { type: "number", about: "the total length of the island's outside edge." },
    rules: [
      "There is exactly one island.",
      "Count every side of a land square that touches water or the edge of the map.",
      "Sides shared by two land squares are inside the island, so they do not count.",
    ],
    examples: [
      { input: { grid: [[1]] }, why: "One land square has 4 sides, and none are shared. The fence is 4 long." },
      { input: { grid: [[1, 1], [1, 1]] }, why: "The island is a 2 by 2 square. Each outside side is 2 long, so the fence is 2 + 2 + 2 + 2 = 8." },
      { input: { grid: [[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]] }, why: "7 land squares have 28 sides in total. 6 pairs of squares touch, hiding 12 sides, so the fence is 28 - 12 = 16." },
    ],
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
    story:
      "A pirate map is a **grid** (rows and columns, like a chessboard). Each square holds the text `\"1\"` for land or `\"0\"` for water.\n\nLand squares that touch **up, down, left or right** belong to the same **island**. Squares that only touch corners (diagonally) are on different islands.\n\nHow many islands are on the map?",
    params: [
      { name: "grid", type: "string[][]", about: "the map, where `\"1\"` is land and `\"0\"` is water." },
    ],
    returns: { type: "number", about: "how many separate islands there are." },
    rules: [
      "Only up, down, left and right count as touching. Diagonal does not.",
      "The squares are text (`\"1\"` and `\"0\"`), not numbers.",
      "An empty map has `0` islands.",
    ],
    examples: [
      { input: { grid: [["1", "1", "0", "0", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "0", "1", "1"]] }, why: "There is a 2 by 2 island in the top-left, a single square in the middle, and a 2-square island at the bottom right. That makes 3." },
      { input: { grid: [["1", "0", "1"], ["0", "1", "0"], ["1", "0", "1"]] }, why: "The 5 land squares only touch at corners, so each one is its own island. The answer is 5." },
      { input: { grid: [] }, why: "The map is empty, so there are 0 islands." },
    ],
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
]
