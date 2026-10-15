import type { CatalogProblemDef } from "../types.js"

// Matrix
export const matrixProblems: CatalogProblemDef[] = [
  {
    seedKey: "matrix-spiral-unwind",
    title: "Matrix Spiral Unwind",
    story:
      "A snail sits on the top-left square of a **grid** (rows and columns, like a chessboard). Every square has a number.\n\nThe snail crawls to the **right** along the top row. When it hits the edge, it turns and goes **down**, then **left**, then **up**, always turning right when it reaches the edge or a square it already visited. It keeps curling inward like a **spiral** until every square is visited.\n\nWrite down the numbers in the order the snail visits them.",
    params: [
      { name: "matrix", type: "number[][]", about: "the grid of numbers, written as a list of rows from top to bottom." },
    ],
    returns: { type: "number[]", about: "every number in the grid, in the order the snail visits them." },
    rules: [
      "The grid does not have to be square.",
      "An empty grid gives an empty list.",
    ],
    examples: [
      { input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, why: "Right along the top: 1, 2, 3. Down: 6, 9. Left: 8, 7. Up: 4. Then the middle: 5." },
      { input: { matrix: [[1], [2], [3]] }, why: "There is only one column, so the snail just goes straight down: 1, 2, 3." },
      { input: { matrix: [] }, why: "There are no squares, so the list is empty." },
    ],
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
    story:
      "You have a square picture made of number tiles. It is a **grid** (rows and columns, like a chessboard) with the same number of rows and columns.\n\nTurn the picture a quarter turn **clockwise** (the way clock hands move), which is 90 degrees. The left column becomes the top row, and the top row becomes the right column.\n\nWhat does the turned picture look like?",
    params: [
      { name: "matrix", type: "number[][]", about: "the square picture, written as a list of rows from top to bottom." },
    ],
    returns: { type: "number[][]", about: "the picture after a quarter turn clockwise, as a list of rows from top to bottom." },
    rules: [
      "The grid is always square (same number of rows and columns).",
      "An empty grid gives an empty grid back.",
    ],
    examples: [
      { input: { matrix: [[1, 2], [3, 4]] }, why: "The left column read from bottom to top is 3, 1, which becomes the new top row. The right column, 4, 2, becomes the second row." },
      { input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, why: "Each column read from bottom to top becomes a row: 7, 4, 1 then 8, 5, 2 then 9, 6, 3." },
      { input: { matrix: [] }, why: "There is nothing to turn, so the answer is an empty grid." },
    ],
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
    story:
      "A library keeps its book numbers in a **grid** (rows and columns, like a chessboard).\n\nThe grid is neat: in every row, the numbers get bigger from left to right. In every column, the numbers get bigger from top to bottom.\n\nIs the book number `target` somewhere in the grid? Can you find out without checking every single square?",
    params: [
      { name: "matrix", type: "number[][]", about: "the grid of book numbers, written as a list of rows from top to bottom." },
      { name: "target", type: "number", about: "the book number you are looking for." },
    ],
    returns: { type: "boolean", about: "`true` if `target` is in the grid, otherwise `false`." },
    rules: [
      "Every row is sorted from smallest to biggest, left to right.",
      "Every column is sorted from smallest to biggest, top to bottom.",
      "An empty grid has nothing in it, so return `false`.",
    ],
    examples: [
      { input: { matrix: [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target: 5 }, why: "Start at the top-right 7. It is too big, so move left to 4. That is too small, so move down to 5. Found it!" },
      { input: { matrix: [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target: 10 }, why: "The biggest number in the grid is 9, so 10 cannot be there." },
      { input: { matrix: [], target: 1 }, why: "The grid is empty, so the answer is false." },
    ],
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
    story:
      "A garden is planted in a **grid** (rows and columns, like a chessboard). Each square has a number. A `0` means a hungry bunny is sitting there.\n\nA bunny eats everything in its whole **row** and its whole **column**, turning those squares into `0`.\n\nOnly the bunnies that were there at the start get to eat. A square that just got eaten does not become a new bunny. Show the garden after all the bunnies finish.",
    params: [
      { name: "matrix", type: "number[][]", about: "the garden, written as a list of rows from top to bottom." },
    ],
    returns: { type: "number[][]", about: "the garden after every row and column that had a `0` at the start is filled with `0`." },
    rules: [
      "Only the zeros in the starting grid spread. New zeros do not spread again.",
      "If there are no zeros, the grid stays the same.",
    ],
    examples: [
      { input: { matrix: [[1, 1, 1], [1, 0, 1], [1, 1, 1]] }, why: "The bunny in the middle eats the middle row and the middle column, making a cross of zeros." },
      { input: { matrix: [[0, 1]] }, why: "The bunny in the top-left eats its row, so the 1 next to it becomes 0 too." },
      { input: { matrix: [[1, 2, 3], [4, 5, 6]] }, why: "There are no zeros, so nothing changes." },
    ],
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
    story:
      "An explorer has a map drawn as a **grid** (rows and columns, like a chessboard). Each square is `1` for land or `0` for water.\n\nLand squares that touch **up, down, left or right** belong to the same **island**. Touching only at a corner does not count.\n\nThe **area** of an island is how many land squares it has. The explorer wants to camp on the biggest island. How big is it?",
    params: [
      { name: "grid", type: "number[][]", about: "the map, where `1` is land and `0` is water." },
    ],
    returns: { type: "number", about: "the number of squares in the biggest island." },
    rules: [
      "Only up, down, left and right count as touching. Diagonal does not.",
      "If there is no land at all (or the grid is empty), return `0`.",
    ],
    examples: [
      { input: { grid: [[0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]] }, why: "The land makes one plus-sign shaped island with 5 squares." },
      { input: { grid: [[1, 0, 1], [1, 0, 1], [1, 0, 1]] }, why: "There are two islands, each a column of 3 squares. The biggest has area 3." },
      { input: { grid: [[0]] }, why: "There is no land, so the answer is 0." },
    ],
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
    story:
      "A little robot likes to read a number **grid** (rows and columns, like a chessboard) in a zig-zag.\n\nIt reads along the **diagonals** (slanted lines of squares). It starts at the top-left square. The first diagonal is read going **up and to the right**, the next one going **down and to the left**, and it keeps switching direction.\n\nWrite down the numbers in the order the robot reads them.",
    params: [
      { name: "mat", type: "number[][]", about: "the grid of numbers, written as a list of rows from top to bottom." },
    ],
    returns: { type: "number[]", about: "every number in the grid, in zig-zag diagonal order." },
    rules: [
      "Diagonal number 0 is just the top-left square. It and every even-numbered diagonal are read up-right; odd-numbered diagonals are read down-left.",
      "The grid does not have to be square.",
      "An empty grid gives an empty list.",
    ],
    examples: [
      { input: { mat: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, why: "Read 1. Then down-left: 2, 4. Then up-right: 7, 5, 3. Then down-left: 6, 8. Finally 9." },
      { input: { mat: [[1, 2, 3]] }, why: "With one row, each diagonal is a single square, so you read 1, 2, 3." },
      { input: { mat: [] }, why: "There are no squares, so the list is empty." },
    ],
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
]
