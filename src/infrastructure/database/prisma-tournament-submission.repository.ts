import type { SubmissionVerdict as PrismaSubmissionVerdict } from "@prisma/client"
import type {
  CreateTournamentSubmissionData,
  SubmissionVerdict,
  TournamentSubmissionRecord,
} from "../../domain/entities/tournament-submission.entity.js"
import type { ITournamentSubmissionRepository } from "../../domain/repositories/tournament-submission.repository.js"
import { prisma } from "./prisma.client.js"

function toVerdict(verdict: PrismaSubmissionVerdict): SubmissionVerdict {
  return verdict
}

function toRecord(record: {
  id: string
  tournamentId: string
  userId: string
  problemId: string
  language: string
  verdict: PrismaSubmissionVerdict
  effectiveElapsedMinutes: number
  submittedAt: Date
}): TournamentSubmissionRecord {
  return {
    id: record.id,
    tournamentId: record.tournamentId,
    userId: record.userId,
    problemId: record.problemId,
    language: record.language,
    verdict: toVerdict(record.verdict),
    effectiveElapsedMinutes: record.effectiveElapsedMinutes,
    submittedAt: record.submittedAt,
  }
}

function toPrismaVerdict(verdict: SubmissionVerdict): PrismaSubmissionVerdict {
  return verdict
}

export class PrismaTournamentSubmissionRepository implements ITournamentSubmissionRepository {
  async create(data: CreateTournamentSubmissionData): Promise<TournamentSubmissionRecord> {
    const record = await prisma.tournamentSubmission.create({
      data: {
        tournamentId: data.tournamentId,
        userId: data.userId,
        problemId: data.problemId,
        language: data.language,
        verdict: toPrismaVerdict(data.verdict),
        effectiveElapsedMinutes: data.effectiveElapsedMinutes,
      },
    })

    return toRecord(record)
  }

  async findByTournamentId(tournamentId: string): Promise<TournamentSubmissionRecord[]> {
    const records = await prisma.tournamentSubmission.findMany({
      where: { tournamentId },
      orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
    })

    return records.map(toRecord)
  }
}
