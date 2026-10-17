import type { Request, Response } from "express"
import type { AdminDashboardService } from "../../application/services/admin-dashboard.service.js"

export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  getSummary = async (_req: Request, res: Response) => {
    const summary = await this.adminDashboardService.getSummary()
    res.json(summary)
  }
}
