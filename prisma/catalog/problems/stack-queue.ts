import type { CatalogProblemDef } from "../types.js"

// Stack / queue / monotonic
export const stackQueueProblems: CatalogProblemDef[] = [
  {
    seedKey: "stackgate-daily-temps",
    title: "Stackgate Daily Temps",
    story:
      "A weather kid writes down the temperature every day.\n\nFor each day, she wonders: \"How many days do I have to wait until it gets **warmer** than today?\"\n\nYou get the temperatures as an **array** (a list of numbers in order). A **stack** (a pile where you take from the top) can hold the days that are still waiting for a warmer day.",
    params: [{ name: "temps", type: "number[]", about: "the temperature on each day, in order." }],
    returns: { type: "number[]", about: "a list the same length as `temps`, where each spot is how many days until a warmer day, or `0` if it never gets warmer." },
    rules: ["Warmer means strictly higher. The same temperature does not count.", "If no warmer day comes later, that day's answer is `0`.", "An empty list gives an empty list back."],
    examples: [
      { input: { temps: [73, 74, 75, 71, 69, 72, 76, 73] }, why: "Day 0 (73) waits 1 day for 74. Day 2 (75) waits 4 days for 76. The last two days never see anything warmer, so they get 0." },
      { input: { temps: [30, 60, 90] }, why: "Each day is beaten by the very next day, except the last day, which gets 0." },
      { input: { temps: [55, 54, 53] }, why: "It only gets colder, so every day gets 0." },
    ],
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
    story:
      "A doorbell camera writes down the time of every ring, in milliseconds (1000 milliseconds is one second).\n\nEach time the bell rings at time `t`, the camera asks: \"How many rings happened in the last 3 seconds, counting this one?\" That means every ring from time `t - 3000` up to `t`.\n\nYou get the ring times as an **array** (a list of numbers in order). A **queue** (a line where the first one in is the first one out) is perfect for dropping old rings.",
    params: [{ name: "pings", type: "number[]", about: "the times of the rings in milliseconds, from earliest to latest." }],
    returns: { type: "number[]", about: "for each ring, in order, how many rings happened from `t - 3000` to `t`." },
    rules: ["Both ends count: a ring at exactly `t - 3000` is included.", "The times are already sorted from smallest to biggest.", "No rings gives an empty list."],
    examples: [
      { input: { pings: [1, 100, 3001, 3002] }, why: "At 3001 the window is 1 to 3001, which holds 3 rings. At 3002 the window is 2 to 3002, so the ring at 1 drops out and the count is still 3." },
      { input: { pings: [1, 3001, 6001] }, why: "At 3001 the ring at 1 is exactly 3000 earlier, so it counts (2 rings). At 6001 only 3001 and 6001 fit, so 2 again." },
      { input: { pings: [] }, why: "There are no rings, so the answer is an empty list." },
    ],
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
    story:
      "A row of towers made of blocks stands side by side. Each tower is 1 block wide, and they touch each other with no gaps.\n\nYou want to paint the **biggest rectangle** you can that fits completely inside the towers. The rectangle sits on the ground and can stretch across several towers, but it can only be as tall as the shortest tower it covers.\n\nYou get the tower heights as an **array** (a list of numbers in order). A **stack** (a pile where you take from the top) helps you find where each tower's rectangle must stop.",
    params: [{ name: "heights", type: "number[]", about: "the height of each tower, from left to right." }],
    returns: { type: "number", about: "the area (width x height) of the biggest rectangle that fits inside the towers." },
    rules: ["Each tower is exactly 1 wide.", "No towers means no rectangle, so return `0`."],
    examples: [
      { input: { heights: [2, 1, 5, 6, 2, 3] }, why: "The towers of height 5 and 6 side by side fit a rectangle 2 wide and 5 tall, so the area is 10." },
      { input: { heights: [2, 4] }, why: "The tower of height 4 alone gives 4. Using both gives 2 x 2 = 4 too. The best is 4." },
      { input: { heights: [] }, why: "There are no towers, so the answer is 0." },
    ],
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
    story:
      "You are stacking numbered plates into a **stack** (a pile where you only add to or take from the top).\n\nYou get a list of commands to follow, one at a time:\n- `[\"push\", x]` puts a plate with number `x` on top.\n- `[\"pop\"]` takes the top plate away.\n- `[\"top\"]` asks: what number is on the top plate?\n- `[\"getMin\"]` asks: what is the smallest number in the whole pile right now?\n\nWrite down the answer to every question (`top` and `getMin`) in order.",
    params: [{ name: "ops", type: "any[]", about: "the list of commands, each one like `[\"push\", 5]`, `[\"pop\"]`, `[\"top\"]` or `[\"getMin\"]`." }],
    returns: { type: "(number|null)[]", about: "the answers to each `top` and `getMin` command, in order." },
    rules: ["`push` and `pop` do not add anything to the answer list.", "If the pile is empty when you ask `top` or `getMin`, write `null`."],
    examples: [
      { input: { ops: [["push", -2], ["push", 0], ["push", -3], ["getMin"], ["pop"], ["top"], ["getMin"]] }, why: "The pile is -2, 0, -3, so the smallest is -3. After popping -3, the top is 0 and the smallest is -2." },
      { input: { ops: [["push", 5], ["getMin"], ["pop"], ["getMin"]] }, why: "With just 5 the smallest is 5. After popping, the pile is empty, so the next answer is null." },
      { input: { ops: [["top"]] }, why: "The pile is empty, so the top is null." },
    ],
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
    story:
      "A train with numbered cars rolls past a window. The window is exactly `k` cars wide.\n\nThe train moves one car at a time. Each time the window is full of cars, you shout out the **biggest number** you can see.\n\nYou get the car numbers as an **array** (a list of numbers in order). A **deque** (a line you can add to or remove from at both ends) helps you keep track of the biggest car quickly.",
    params: [
      { name: "nums", type: "number[]", about: "the number on each train car, from front to back." },
      { name: "k", type: "number", about: "how many cars fit in the window at once." },
    ],
    returns: { type: "number[]", about: "the biggest number in each full window, from left to right." },
    rules: ["Only count the window when it holds exactly `k` cars.", "If there are no cars, or `k` is `0` or less, return an empty list.", "If `k` is bigger than the number of cars, the window is never full, so return an empty list."],
    examples: [
      { input: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 }, why: "The windows are [1,3,-1], [3,-1,-3], [-1,-3,5], [-3,5,3], [5,3,6], [3,6,7], and their biggest numbers are 3, 3, 5, 5, 6, 7." },
      { input: { nums: [9, 8, 7, 6], k: 2 }, why: "The windows are [9,8], [8,7], [7,6], so the answers are 9, 8, 7." },
      { input: { nums: [], k: 3 }, why: "There are no cars, so there are no windows and the answer is an empty list." },
    ],
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
    story:
      "A robot calculator reads math in a funny order called **Reverse Polish Notation**: the numbers come first, and the sign comes after them. So `2 1 +` means 2 + 1.\n\nThe robot keeps a **stack** (a pile where you take from the top). When it reads a number, it puts it on the pile. When it reads a sign, it takes the top two numbers off, does the math, and puts the answer back on the pile.\n\nWhat number is left at the end?",
    params: [{ name: "tokens", type: "string[]", about: "the pieces of the math problem in order. Each one is a whole number like `\"13\"` or `\"-2\"`, or a sign: `\"+\"`, `\"-\"`, `\"*\"` or `\"/\"`." }],
    returns: { type: "number", about: "the final answer of the math problem." },
    rules: ["Numbers are whole numbers written as strings, and can be negative.", "For a sign, the number that was pushed first goes on the left. So `5 3 -` means 5 - 3.", "Division cuts off the decimal part toward zero: 7 / 2 is 3, and -7 / 2 is -3.", "The problem is always valid and leaves exactly one number."],
    examples: [
      { input: { tokens: ["2", "1", "+", "3", "*"] }, why: "First 2 + 1 = 3. Then 3 * 3 = 9." },
      { input: { tokens: ["4", "13", "5", "/", "+"] }, why: "13 / 5 is 2.6, which cuts down to 2. Then 4 + 2 = 6." },
      { input: { tokens: ["3"] }, why: "There is only one number and no signs, so the answer is 3." },
    ],
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
    story:
      "A friend sends you a squished secret message. Writing `3[a]` is short for `aaa`: repeat what is inside the brackets 3 times.\n\nBrackets can even go inside other brackets! `2[b3[c]]` means \"repeat `bccc` 2 times\", which is `bcccbccc`.\n\nYou get the message as a **string** (a piece of text). Unsquish it. A **stack** (a pile where you take from the top) helps you remember where you were before each bracket.",
    params: [{ name: "s", type: "string", about: "the squished message, using the `k[...]` pattern." }],
    returns: { type: "string", about: "the full message after every `k[...]` part is repeated `k` times." },
    rules: ["Brackets can be inside other brackets.", "The repeat number `k` can have more than one digit, like `12[x]`.", "Letters outside any brackets stay as they are.", "An empty message gives an empty string."],
    examples: [
      { input: { s: "3[a]2[bc]" }, why: "3[a] is aaa and 2[bc] is bcbc. Put together, that is aaabcbc." },
      { input: { s: "3[a2[c]]" }, why: "Inside first: 2[c] is cc, so a2[c] is acc. Repeat that 3 times to get accaccacc." },
      { input: { s: "abc" }, why: "There are no brackets, so the message stays abc." },
    ],
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
    story:
      "Space rocks called asteroids are floating in a straight line.\n\nEach rock has a number. A **positive** number means the rock flies to the **right**, and a **negative** number means it flies to the **left**. The size of the number (ignoring the minus sign) is how big the rock is.\n\nWhen a rock flying right meets a rock flying left, they crash. The bigger rock survives and the smaller one breaks. If they are the same size, both break. Which rocks are left at the end? A **stack** (a pile where you take from the top) is great for this.",
    params: [{ name: "asts", type: "number[]", about: "the rocks from left to right. The sign is the direction and the size is how big it is." }],
    returns: { type: "number[]", about: "the rocks that survive, still in their left-to-right order." },
    rules: ["Rocks going the same way never crash.", "A rock going left that is to the left of a rock going right never crashes with it, because they move apart.", "Only a right-moving rock followed later by a left-moving rock can crash.", "Same size means both break. No rocks gives an empty list."],
    examples: [
      { input: { asts: [5, 10, -5] }, why: "The -5 crashes into 10. 10 is bigger, so -5 breaks. 5 and 10 are left." },
      { input: { asts: [8, -8] }, why: "8 and -8 crash and are the same size, so both break and nothing is left." },
      { input: { asts: [-2, -1, 1, 2] }, why: "The left-movers are already on the left and the right-movers on the right, so they all fly apart. Nobody crashes." },
    ],
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
]
