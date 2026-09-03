import type {
  CreateReportData,
  Report,
  ReportStatus,
  ReportWithReporter,
  ResolveReportData,
} from "../../domain/entities/moderation.entity.js"
import type { IReportRepository } from "../../domain/repositories/report.repository.js"
import { prisma } from "./prisma.client.js"

function toReport(record: {
  id: string
  reporterId: string
  targetType: Report["targetType"]
  targetId: string
  contextTournamentId: string | null
  category: Report["category"]
  details: string
  status: ReportStatus
  resolutionNote: string | null
  resolvedById: string | null
  resolvedAt: Date | null
  createdAt: Date
}): Report {
  return { ...record }
}

function toReportWithReporter(record: {
  id: string
  reporterId: string
  targetType: Report["targetType"]
  targetId: string
  contextTournamentId: string | null
  category: Report["category"]
  details: string
  status: ReportStatus
  resolutionNote: string | null
  resolvedById: string | null
  resolvedAt: Date | null
  createdAt: Date
  reporter: { displayName: string; email: string }
}): ReportWithReporter {
  return {
    ...toReport(record),
    reporterDisplayName: record.reporter.displayName,
    reporterEmail: record.reporter.email,
  }
}

export class PrismaReportRepository implements IReportRepository {
  async create(data: CreateReportData): Promise<Report> {
    const record = await prisma.report.create({
      data: {
        reporterId: data.reporterId,
        targetType: data.targetType,
        targetId: data.targetId,
        contextTournamentId: data.contextTournamentId ?? null,
        category: data.category,
        details: data.details,
      },
    })
    return toReport(record)
  }

  async findById(id: string): Promise<ReportWithReporter | null> {
    const record = await prisma.report.findUnique({
      where: { id },
      include: { reporter: { select: { displayName: true, email: true } } },
    })
    return record ? toReportWithReporter(record) : null
  }

  async findMany(status?: ReportStatus): Promise<ReportWithReporter[]> {
    const records = await prisma.report.findMany({
      where: status ? { status } : undefined,
      include: { reporter: { select: { displayName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return records.map(toReportWithReporter)
  }

  async countOpen(): Promise<number> {
    return prisma.report.count({ where: { status: "OPEN" } })
  }

  async countOpenByReporterSince(reporterId: string, since: Date): Promise<number> {
    return prisma.report.count({
      where: {
        reporterId,
        createdAt: { gte: since },
      },
    })
  }

  async resolve(id: string, data: ResolveReportData): Promise<ReportWithReporter> {
    const record = await prisma.report.update({
      where: { id },
      data: {
        status: data.status,
        resolutionNote: data.resolutionNote ?? null,
        resolvedById: data.resolvedById,
        resolvedAt: new Date(),
      },
      include: { reporter: { select: { displayName: true, email: true } } },
    })
    return toReportWithReporter(record)
  }

  async findRecentForTarget(
    targetType: string,
    targetId: string,
    limit = 20,
  ): Promise<ReportWithReporter[]> {
    const records = await prisma.report.findMany({
      where: {
        targetType: targetType as Report["targetType"],
        targetId,
      },
      include: { reporter: { select: { displayName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
    return records.map(toReportWithReporter)
  }
}
