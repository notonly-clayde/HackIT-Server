export type SubmissionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "RUNTIME_ERROR"
  | "TIMEOUT"
  | "COMPILE_ERROR"
  | "UNSUPPORTED"

export type TournamentSubmissionRecord = {
  id: string
  tournamentId: string
  userId: string
  problemId: string
  language: string
  verdict: SubmissionVerdict
  effectiveElapsedMinutes: number
  submittedAt: Date
}

export type CreateTournamentSubmissionData = {
  tournamentId: string
  userId: string
  problemId: string
  language: string
  verdict: SubmissionVerdict
  effectiveElapsedMinutes: number
}
