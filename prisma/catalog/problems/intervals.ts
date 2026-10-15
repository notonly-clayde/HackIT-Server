import type { CatalogProblemDef } from "../types.js"

// Intervals
export const intervalsProblems: CatalogProblemDef[] = [
  {
    seedKey: "interval-merge-ranges",
    title: "Interval Merge Ranges",
    story:
      "Kids are painting stripes on a long fence. Each kid paints from one post number to another. Some stripes overlap.\n\nEach stripe is an **interval** (a stretch from a start to an end), written as `[start, end]`.\n\nThe teacher wants a tidy list: join together any stripes that overlap or touch, so each painted stretch is listed only once, from left to right.",
    params: [{ name: "intervals", type: "number[][]", about: "the painted stripes, each as `[start, end]`, in any order." }],
    returns: { type: "number[][]", about: "the joined stripes as `[start, end]` pairs, sorted by start." },
    rules: ["Stripes that just touch, like `[1, 4]` and `[4, 5]`, count as overlapping and get joined.", "The input may be in any order.", "An empty list gives an empty list."],
    examples: [
      { input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }, why: "[1, 3] and [2, 6] overlap, so they join into [1, 6]. The other two stripes do not touch anything." },
      { input: { intervals: [[1, 4], [4, 5]] }, why: "The stripes touch at 4, so they join into [1, 5]." },
      { input: { intervals: [] }, why: "No stripes were painted, so the list stays empty." },
    ],
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
    story:
      "A pet sitter keeps a calendar of busy times. Each busy time is an **interval** (a stretch from a start to an end), written as `[start, end]`. The list is already sorted, and no two busy times overlap.\n\nA new booking comes in. Add it to the calendar. If it overlaps or touches any busy times, join them all into one bigger busy time.\n\nReturn the updated calendar, still sorted and with no overlaps.",
    params: [
      { name: "intervals", type: "number[][]", about: "the current busy times as `[start, end]`, sorted by start and not overlapping." },
      { name: "newInterval", type: "number[]", about: "the new booking as `[start, end]`." },
    ],
    returns: { type: "number[][]", about: "the busy times after adding the new booking, sorted and with no overlaps." },
    rules: ["Times that just touch, like ending at 5 and starting at 5, get joined.", "If the calendar is empty, the answer is just the new booking.", "The new booking can land before, between, or after the existing times."],
    examples: [
      { input: { intervals: [[1, 3], [6, 9]], newInterval: [2, 5] }, why: "[2, 5] overlaps [1, 3], so they join into [1, 5]. [6, 9] stays as it is." },
      { input: { intervals: [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval: [4, 8] }, why: "[4, 8] overlaps [3, 5], [6, 7] and [8, 10], so all of them join into [3, 10]." },
      { input: { intervals: [], newInterval: [5, 7] }, why: "The calendar was empty, so the new booking is the only busy time." },
    ],
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
    story:
      "Your class has a list of club meetings today, and you want to go to **all** of them. You can only be in one place at a time.\n\nEach meeting is an **interval** written as `[start, end]`. A meeting ends right at its end time, so you can leave one meeting at 5 and walk into another that starts at 5.\n\nCan you go to every meeting without any two of them overlapping?",
    params: [{ name: "intervals", type: "number[][]", about: "the meetings, each as `[start, end]`, in any order." }],
    returns: { type: "boolean", about: "`true` if no two meetings overlap, otherwise `false`." },
    rules: ["Meetings are half-open `[start, end)`: one ending at 5 and another starting at 5 do not overlap.", "The meetings may be listed in any order.", "With zero or one meeting, the answer is `true`."],
    examples: [
      { input: { intervals: [[0, 30], [5, 10], [15, 20]] }, why: "The meeting from 0 to 30 overlaps the one from 5 to 10, so you cannot go to all of them." },
      { input: { intervals: [[1, 5], [5, 10]] }, why: "The first meeting ends at 5, just as the second starts, so there is no overlap." },
      { input: { intervals: [] }, why: "There are no meetings, so nothing can clash." },
    ],
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
    story:
      "Long balloons are taped flat along a wall. Each balloon covers a stretch of the wall from `xstart` to `xend`.\n\nYou can shoot a toy arrow straight up the wall at any spot `x`. It pops **every** balloon that covers that spot.\n\nWhat is the **fewest** arrows you need to pop all the balloons?",
    params: [{ name: "points", type: "number[][]", about: "the balloons, each as `[xstart, xend]`, in any order." }],
    returns: { type: "number", about: "the smallest number of arrows that pops every balloon." },
    rules: ["A balloon's edges count: an arrow at exactly `xstart` or `xend` pops it.", "So balloons that just touch, like `[1, 2]` and `[2, 3]`, can be popped by one arrow.", "No balloons means `0` arrows."],
    examples: [
      { input: { points: [[10, 16], [2, 8], [1, 6], [7, 12]] }, why: "An arrow at 6 pops [1, 6] and [2, 8]. An arrow at 12 pops [7, 12] and [10, 16]. So 2 arrows are enough." },
      { input: { points: [[1, 2], [3, 4], [5, 6], [7, 8]] }, why: "No two balloons share a spot, so each one needs its own arrow: 4 arrows." },
      { input: { points: [[1, 2], [2, 3], [3, 4], [4, 5]] }, why: "An arrow at 2 pops the first two, and an arrow at 4 pops the last two, so 2 arrows." },
    ],
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
]
