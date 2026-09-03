import type { SubmissionVerdict, TournamentSubmissionRecord } from "../../domain/entities/tournament-submission.entity.js"

export type StandingsPlayer = {
  userId: string
  displayName: string
}

export type StandingsSubmission = Pick<
  TournamentSubmissionRecord,
  "userId" | "problemId" | "verdict" | "submittedAt" | "effectiveElapsedMinutes"
>

export type ComputedStandingsEntry = {
  userId: string
  displayName: string
  solved: number
  penalty: number
  score: number
  earliestAcceptedAt: string | null
}

export type ComputedStandings = {
  entries: ComputedStandingsEntry[]
}

const WRONG_ATTEMPT_PENALTY_MINUTES = 20

function isWrongAttempt(verdict: SubmissionVerdict): boolean {
  return verdict !== "ACCEPTED"
}

export function computeEffectiveElapsedMinutes(input: {
  liveStartedAt: Date | null
  pausedTotalMs: number
  pausedAt: Date | null
  resumeAt: Date | null
  submittedAt: Date
}): number {
  const { liveStartedAt, pausedTotalMs, pausedAt, resumeAt, submittedAt } = input

  if (!liveStartedAt) return 0

  let elapsedMs = submittedAt.getTime() - liveStartedAt.getTime() - pausedTotalMs

  if (pausedAt && submittedAt.getTime() >= pausedAt.getTime()) {
    const pauseEndMs = resumeAt?.getTime() ?? submittedAt.getTime()
    if (submittedAt.getTime() < pauseEndMs) {
      elapsedMs -= submittedAt.getTime() - pausedAt.getTime()
    }
  }

  return Math.max(0, Math.floor(elapsedMs / 60_000))
}

export function computeStandings(
  players: StandingsPlayer[],
  problemPoints: Record<string, number>,
  submissions: StandingsSubmission[],
): ComputedStandings {
  const submissionsByUser = new Map<string, StandingsSubmission[]>()

  for (const submission of submissions) {
    const list = submissionsByUser.get(submission.userId) ?? []
    list.push(submission)
    submissionsByUser.set(submission.userId, list)
  }

  const entries: ComputedStandingsEntry[] = players.map((player) => {
    const userSubmissions = submissionsByUser.get(player.userId) ?? []
    const submissionsByProblem = new Map<string, StandingsSubmission[]>()

    for (const submission of userSubmissions) {
      const list = submissionsByProblem.get(submission.problemId) ?? []
      list.push(submission)
      submissionsByProblem.set(submission.problemId, list)
    }

    let solved = 0
    let score = 0
    let penalty = 0
    let earliestAcceptedAt: string | null = null

    for (const [problemId, problemSubmissions] of submissionsByProblem) {
      const points = problemPoints[problemId] ?? 0
      const firstAccepted = problemSubmissions.find((item) => item.verdict === "ACCEPTED")

      if (!firstAccepted) continue

      const firstAcceptedIndex = problemSubmissions.indexOf(firstAccepted)
      const wrongBeforeAccept = problemSubmissions
        .slice(0, firstAcceptedIndex)
        .filter((item) => isWrongAttempt(item.verdict)).length

      solved += 1
      score += points
      penalty += firstAccepted.effectiveElapsedMinutes + wrongBeforeAccept * WRONG_ATTEMPT_PENALTY_MINUTES

      const acceptedAt = firstAccepted.submittedAt.toISOString()
      if (!earliestAcceptedAt || acceptedAt < earliestAcceptedAt) {
        earliestAcceptedAt = acceptedAt
      }
    }

    return {
      userId: player.userId,
      displayName: player.displayName,
      solved,
      penalty,
      score,
      earliestAcceptedAt,
    }
  })

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.penalty !== b.penalty) return a.penalty - b.penalty
    if (a.earliestAcceptedAt && b.earliestAcceptedAt) {
      return a.earliestAcceptedAt.localeCompare(b.earliestAcceptedAt)
    }
    if (a.earliestAcceptedAt) return -1
    if (b.earliestAcceptedAt) return 1
    return a.displayName.localeCompare(b.displayName)
  })

  return { entries }
}

export function rankStandingsEntries(
  entries: ComputedStandingsEntry[],
): Array<ComputedStandingsEntry & { rank: number }> {
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
}
