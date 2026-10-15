import type { CatalogProblemDef } from "../types.js"
import { arraysProblems } from "./arrays.js"
import { stringsProblems } from "./strings.js"
import { hashMapProblems } from "./hash-map.js"
import { stackQueueProblems } from "./stack-queue.js"
import { linkedListProblems } from "./linked-list.js"
import { treesProblems } from "./trees.js"
import { graphsProblems } from "./graphs.js"
import { matrixProblems } from "./matrix.js"
import { intervalsProblems } from "./intervals.js"
import { binarySearchProblems } from "./binary-search.js"
import { slidingWindowProblems } from "./sliding-window.js"
import { dynamicProgrammingProblems } from "./dynamic-programming.js"
import { bitManipulationProblems } from "./bit-manipulation.js"
import { mathProblems } from "./math.js"
import { unionFindProblems } from "./union-find.js"
import { trieProblems } from "./trie.js"
import { backtrackingProblems } from "./backtracking.js"
import { miscProblems } from "./misc.js"

export const catalogProblems: CatalogProblemDef[] = [
  ...arraysProblems,
  ...stringsProblems,
  ...hashMapProblems,
  ...stackQueueProblems,
  ...linkedListProblems,
  ...treesProblems,
  ...graphsProblems,
  ...matrixProblems,
  ...intervalsProblems,
  ...binarySearchProblems,
  ...slidingWindowProblems,
  ...dynamicProgrammingProblems,
  ...bitManipulationProblems,
  ...mathProblems,
  ...unionFindProblems,
  ...trieProblems,
  ...backtrackingProblems,
  ...miscProblems,
]
