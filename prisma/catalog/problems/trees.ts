import type { CatalogProblemDef } from "../types.js"

// Trees / BST
export const treesProblems: CatalogProblemDef[] = [
  {
    seedKey: "arbor-max-depth",
    title: "Arbor Max Depth",
    story:
      "A squirrel lives at the top of a family tree of apple branches. It wants to know how many floors tall the tree is.\n\nThe tree is a **binary tree** (like a family tree where each person has at most two children, a left child and a right child). Each spot in the tree is a **node**, written like `{\"val\": 3, \"left\": ..., \"right\": ...}`. A missing child is `null` or just left out.\n\nThe **depth** is how many nodes you pass through on the longest trip from the top (the **root**) down to the very bottom.",
    params: [{ name: "root", type: "object|null", about: "the top node of the tree, or `null` if there is no tree." }],
    returns: { type: "number", about: "the number of nodes on the longest path from the root down to a bottom node." },
    rules: ["An empty tree (`null`) has depth `0`.", "A tree with just one node has depth `1`.", "Children may be written as `null` or simply left out; both mean \"no child\"."],
    examples: [
      { input: { root: { val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } } }, why: "The longest trip is 3 to 20 to 15 (or 7). That passes through 3 nodes, so the depth is 3." },
      { input: { root: { val: 1, left: { val: 2, left: { val: 3 } } } }, why: "The tree is a straight line 1, 2, 3 going left, so the depth is 3." },
      { input: { root: null }, why: "There is no tree at all, so the depth is 0." },
    ],
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
    story:
      "You are holding a picture of a tree up to a mirror. In the mirror, everything on the left shows up on the right, and everything on the right shows up on the left.\n\nThe tree is a **binary tree** (like a family tree where each person has at most two children, a left child and a right child). Each spot is a **node**, written like `{\"val\": 4, \"left\": ..., \"right\": ...}`. A missing child is `null` or just left out.\n\nBuild the mirror picture: at **every** node, swap its left child and its right child.",
    params: [{ name: "root", type: "object|null", about: "the top node of the tree, or `null` if there is no tree." }],
    returns: { type: "object|null", about: "the top node of the mirrored tree, with every node's left and right children swapped." },
    rules: ["An empty tree (`null`) stays `null`.", "Swap at every level, not just at the top.", "In your answer, every node has both `left` and `right`, using `null` for a missing child."],
    examples: [
      { input: { root: { val: 2, left: { val: 1 }, right: { val: 3 } } }, why: "The root 2 keeps its place, and its children 1 and 3 trade sides, so 3 is now on the left and 1 on the right." },
      { input: { root: { val: 1, left: { val: 2 } } }, why: "Node 2 was the left child, so in the mirror it becomes the right child." },
      { input: { root: null }, why: "There is no tree to mirror, so the answer is null." },
    ],
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
    story:
      "Two kids each built a tree out of toy blocks. They want to know if their trees are **exact twins**.\n\nEach tree is a **binary tree** (like a family tree where each person has at most two children, a left child and a right child). Each spot is a **node**, written like `{\"val\": 1, \"left\": ..., \"right\": ...}`. A missing child is `null` or just left out.\n\nThe trees are twins only if they have the same shape **and** the same number in every matching spot.",
    params: [
      { name: "p", type: "object|null", about: "the top node of the first kid's tree, or `null` for no tree." },
      { name: "q", type: "object|null", about: "the top node of the second kid's tree, or `null` for no tree." },
    ],
    returns: { type: "boolean", about: "`true` if the two trees have the same shape and the same values everywhere, otherwise `false`." },
    rules: ["Two empty trees (`null` and `null`) are twins.", "An empty tree and a non-empty tree are not twins.", "A left child and a right child are different spots, even if the number is the same."],
    examples: [
      { input: { p: { val: 1, left: { val: 2 }, right: { val: 3 } }, q: { val: 1, left: { val: 2 }, right: { val: 3 } } }, why: "Both trees have 1 on top, 2 on the left and 3 on the right, so they match." },
      { input: { p: { val: 1, left: { val: 2 } }, q: { val: 1, right: { val: 2 } } }, why: "In the first tree 2 is a left child, but in the second it is a right child, so the shapes differ." },
      { input: { p: null, q: null }, why: "Both trees are empty, and two empty trees count as the same." },
    ],
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
    story:
      "A family is lining up for a photo. Grandma stands in the top row, her children in the next row, the grandchildren in the row after that, and so on.\n\nThe family is a **binary tree** (like a family tree where each person has at most two children, a left child and a right child). Each person is a **node**, written like `{\"val\": 3, \"left\": ..., \"right\": ...}`. A missing child is `null` or just left out.\n\nList the numbers **row by row** from the top, and inside each row go from left to right.",
    params: [{ name: "root", type: "object|null", about: "the top node of the tree, or `null` if there is no tree." }],
    returns: { type: "number[][]", about: "a list of rows, where each row is a list of the values on that level from left to right." },
    rules: ["An empty tree (`null`) gives an empty list `[]`.", "Rows go from the top (the root) down to the bottom."],
    examples: [
      { input: { root: { val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } } }, why: "Row 1 is just 3. Row 2 is 9 and 20. Row 3 is 15 and 7, the children of 20." },
      { input: { root: { val: 1, right: { val: 2, right: { val: 3 } } } }, why: "Each row has only one person, so the rows are [1], [2] and [3]." },
      { input: { root: null }, why: "Nobody is in the photo, so there are no rows." },
    ],
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
    story:
      "A librarian sorts books on a tree-shaped shelf. The rule is: books with **smaller** numbers go to the left, and books with **bigger** numbers go to the right.\n\nThe shelf is a **binary tree** (like a family tree where each spot has at most two children, a left child and a right child). Each spot is a **node**, written like `{\"val\": 2, \"left\": ..., \"right\": ...}`. A missing child is `null` or just left out.\n\nA **binary search tree** (BST) follows the rule everywhere: every number in a node's whole left side is smaller than it, and every number in its whole right side is bigger. Check if the librarian did it right.",
    params: [{ name: "root", type: "object|null", about: "the top node of the shelf tree, or `null` if the shelf is empty." }],
    returns: { type: "boolean", about: "`true` if the tree is a valid binary search tree, otherwise `false`." },
    rules: ["\"Smaller\" and \"bigger\" are strict: two books with the same number break the rule.", "The rule covers the whole left and right sides, not just the direct children. Reading the tree left-to-right (in-order) must give strictly increasing numbers.", "An empty tree (`null`) counts as valid."],
    examples: [
      { input: { root: { val: 2, left: { val: 1 }, right: { val: 3 } } }, why: "1 is smaller than 2 and sits on the left, 3 is bigger and sits on the right, so it is valid." },
      { input: { root: { val: 5, left: { val: 4 }, right: { val: 6, left: { val: 3 }, right: { val: 7 } } } }, why: "3 is on the right side of 5, but 3 is smaller than 5, so the tree is not valid even though 3 is fine next to 6." },
      { input: { root: { val: 2, left: { val: 2 } } }, why: "The left child is equal to its parent, not smaller, so the rule is broken." },
    ],
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
    story:
      "Two cousins want to find the **closest relative they share** in the family tree.\n\nThe family is a **binary search tree** (BST): a tree where each person has at most two children, everyone on a person's left side has a smaller number, and everyone on the right side has a bigger number. Each person is a **node**, written like `{\"val\": 6, \"left\": ..., \"right\": ...}`. A missing child is `null` or just left out.\n\nThe **lowest common ancestor** is the lowest person in the tree who has both cousins below them (or is one of them). Return that person's number.",
    params: [
      { name: "root", type: "object", about: "the top node of the family tree, which is a valid BST." },
      { name: "p", type: "number", about: "the number of the first cousin." },
      { name: "q", type: "number", about: "the number of the second cousin." },
    ],
    returns: { type: "number", about: "the value of the lowest node that has both `p` and `q` in its family below it." },
    rules: ["Both `p` and `q` are in the tree.", "A person counts as their own ancestor, so if `p` is above `q`, the answer is `p`.", "All numbers in the tree are different."],
    examples: [
      { input: { root: { val: 6, left: { val: 2, left: { val: 0 }, right: { val: 4, left: { val: 3 }, right: { val: 5 } } }, right: { val: 8, left: { val: 7 }, right: { val: 9 } } }, p: 2, q: 8 }, why: "2 is on the left of 6 and 8 is on the right of 6, so 6 is the lowest person above both." },
      { input: { root: { val: 6, left: { val: 2, left: { val: 0 }, right: { val: 4 } }, right: { val: 8 } }, p: 2, q: 4 }, why: "4 is a child of 2, and 2 counts as its own ancestor, so the answer is 2." },
    ],
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
    story:
      "A ladybug starts at the top of a tree and climbs down, collecting the number on every spot it touches. It stops only when it reaches a **leaf** (a spot with no children at all).\n\nThe tree is a **binary tree** (like a family tree where each spot has at most two children, a left child and a right child). Each spot is a **node**, written like `{\"val\": 5, \"left\": ..., \"right\": ...}`. A missing child is `null` or just left out.\n\nCan the ladybug pick a path from the top to a leaf so the numbers add up to exactly `target`?",
    params: [
      { name: "root", type: "object|null", about: "the top node of the tree, or `null` if there is no tree." },
      { name: "target", type: "number", about: "the total the ladybug wants to collect." },
    ],
    returns: { type: "boolean", about: "`true` if some top-to-leaf path adds up to `target`, otherwise `false`." },
    rules: ["The path must start at the top (the root) and end at a leaf. Stopping halfway does not count.", "An empty tree (`null`) has no paths, so the answer is `false`, even when `target` is 0.", "Numbers can be negative."],
    examples: [
      { input: { root: { val: 5, left: { val: 4, left: { val: 11, left: { val: 7 }, right: { val: 2 } } }, right: { val: 8, left: { val: 13 }, right: { val: 4, right: { val: 1 } } } }, target: 22 }, why: "The path 5, 4, 11, 2 ends at a leaf and adds up to 22." },
      { input: { root: { val: 1, left: { val: 2 } }, target: 1 }, why: "Node 1 is not a leaf because it has a child. The only full path is 1, 2 which adds to 3, so the answer is false." },
      { input: { root: null, target: 0 }, why: "There is no tree, so there is no path at all." },
    ],
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
    story:
      "Two ants live in a tree. They want to sit as far apart as possible, walking only along the branches.\n\nThe tree is a **binary tree** (like a family tree where each spot has at most two children, a left child and a right child). Each spot is a **node**, written like `{\"val\": 1, \"left\": ..., \"right\": ...}`. A missing child is `null` or just left out. A branch between a parent and a child is called an **edge**.\n\nThe **diameter** is the longest walk between any two nodes, counted in edges. The walk does not have to pass through the top of the tree.",
    params: [{ name: "root", type: "object|null", about: "the top node of the tree, or `null` if there is no tree." }],
    returns: { type: "number", about: "the number of edges on the longest path between any two nodes." },
    rules: ["Count edges (branches), not nodes.", "An empty tree or a tree with one node has diameter `0`."],
    examples: [
      { input: { root: { val: 1, left: { val: 2, left: { val: 4 }, right: { val: 5 } }, right: { val: 3 } } }, why: "The walk 4 to 2 to 1 to 3 uses 3 edges, and no walk is longer." },
      { input: { root: { val: 1, left: { val: 2 } } }, why: "The only walk is 1 to 2, which is 1 edge." },
      { input: { root: { val: 1 } }, why: "With just one node there is nowhere to walk, so the answer is 0." },
    ],
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
    story:
      "You want to text a tree to a friend, but you can only send a flat list of numbers. So you write it down in a special order that your friend can use to rebuild it.\n\nThe tree is a **binary tree** (like a family tree where each spot has at most two children, a left child and a right child). Each spot is a **node**, written like `{\"val\": 1, \"left\": ..., \"right\": ...}`. A missing child is `null` or just left out.\n\nUse **preorder**: write the node's number first, then write its whole left side, then its whole right side. Whenever you reach a missing child, write `null` so your friend knows nothing is there.",
    params: [{ name: "root", type: "object|null", about: "the top node of the tree, or `null` if there is no tree." }],
    returns: { type: "(number|null)[]", about: "the preorder list of values, with `null` written for every missing child." },
    rules: ["Every missing child becomes a `null`, including both missing children of a leaf.", "An empty tree is written as `[null]`."],
    examples: [
      { input: { root: { val: 1, left: { val: 2 }, right: { val: 3 } } }, why: "Write 1, then the left side: 2 with two missing children (null, null), then the right side: 3 with null, null." },
      { input: { root: { val: 1, right: { val: 2 } } }, why: "Write 1, then null for the missing left child, then 2 followed by null, null for its missing children." },
      { input: { root: null }, why: "The tree itself is missing, so you write a single null." },
    ],
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
    story:
      "A tree was knocked over, and all you have left are two lists that describe it. Your job is to stand the tree back up.\n\nThe tree is a **binary tree** (like a family tree where each spot has at most two children, a left child and a right child). Each spot is a **node**, written like `{\"val\": 3, \"left\": ..., \"right\": ...}`.\n\nThe **preorder** list writes a node, then its left side, then its right side. The **inorder** list writes the left side, then the node, then the right side. Hint: the first number in preorder is always the top, and finding it in inorder tells you who is on its left and who is on its right.",
    params: [
      { name: "preorder", type: "number[]", about: "the tree's values in preorder (node, left side, right side)." },
      { name: "inorder", type: "number[]", about: "the tree's values in inorder (left side, node, right side)." },
    ],
    returns: { type: "object|null", about: "the top node of the rebuilt tree, or `null` if the lists are empty." },
    rules: ["All values are different, so there is only one possible tree.", "Both lists describe the same tree and have the same length.", "In your answer, every node has both `left` and `right`, using `null` for a missing child.", "Empty lists give `null`."],
    examples: [
      { input: { preorder: [3, 9, 20, 15, 7], inorder: [9, 3, 15, 20, 7] }, why: "3 comes first in preorder, so it is the top. In inorder, 9 is left of 3 and 15, 20, 7 are right of it. Repeat on each side: 20 is the top of the right side with 15 on its left and 7 on its right." },
      { input: { preorder: [1, 2, 3], inorder: [3, 2, 1] }, why: "1 is the top and everything in inorder is to its left. Then 2 is the top of that side with 3 to its left, so the tree leans all the way left." },
      { input: { preorder: [], inorder: [] }, why: "No values means no tree, so the answer is null." },
    ],
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
]
