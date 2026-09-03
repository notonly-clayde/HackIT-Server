import type {
  CreateProblemData,
  ProblemFilters,
  ProblemVisibility,
  ProblemWithTests,
  UpdateProblemData,
} from "../entities/problem.entity.js"

export interface IProblemRepository {
  findMany(filters: ProblemFilters): Promise<ProblemWithTests[]>
  findById(id: string): Promise<ProblemWithTests | null>
  create(data: CreateProblemData): Promise<ProblemWithTests>
  update(id: string, data: UpdateProblemData): Promise<ProblemWithTests>
  updateVisibility(
    id: string,
    visibility: ProblemVisibility,
    options?: { reviewNote?: string | null },
  ): Promise<ProblemWithTests>
}
