import type {
  CreateReportData,
  Report,
  ReportStatus,
  ReportWithReporter,
  ResolveReportData,
} from "../entities/moderation.entity.js"

export interface IReportRepository {
  create(data: CreateReportData): Promise<Report>
  findById(id: string): Promise<ReportWithReporter | null>
  findMany(status?: ReportStatus): Promise<ReportWithReporter[]>
  countOpen(): Promise<number>
  countOpenByReporterSince(reporterId: string, since: Date): Promise<number>
  resolve(id: string, data: ResolveReportData): Promise<ReportWithReporter>
  findRecentForTarget(targetType: string, targetId: string, limit?: number): Promise<ReportWithReporter[]>
}
