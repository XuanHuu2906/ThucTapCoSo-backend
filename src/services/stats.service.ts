import { prisma } from '../config/prisma.js';

export class StatsService {
  /**
   * UC-15: Thống kê tuyển dụng cho Recruiter
   */
  async getRecruitmentStats(filters: { timeFilter?: string; jobFilter?: string; deptFilter?: string }) {
    // Build date filter
    const now = new Date();
    let dateFrom: Date | null = null;
    if (filters.timeFilter === 'this_month') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filters.timeFilter === 'last_month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      dateFrom = first;
    } else if (filters.timeFilter === 'this_year') {
      dateFrom = new Date(now.getFullYear(), 0, 1);
    }

    // Fetch all applications with job info
    const where: any = {};
    if (dateFrom) {
      where.appliedDate = { gte: dateFrom };
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        jobPosting: { select: { title: true, deptName: true } },
        candidate: { select: { fullName: true } },
        offer: { select: { status: true } },
      },
      orderBy: { appliedDate: 'desc' },
    });

    // Apply job filter
    let filteredApps = applications;
    if (filters.jobFilter && filters.jobFilter !== 'all') {
      filteredApps = filteredApps.filter((a) => a.jobPosting?.title === filters.jobFilter);
    }
    if (filters.deptFilter && filters.deptFilter !== 'all' && filters.deptFilter !== 'Tất cả') {
      filteredApps = filteredApps.filter((a) => a.jobPosting?.deptName === filters.deptFilter);
    }

    // === Computed stats ===
    const totalApplications = filteredApps.length;

    const funnel = [
      { name: 'Ứng tuyển', value: filteredApps.length, fill: '#3b82f6' },
      { name: 'Sàng lọc', value: filteredApps.filter((a) =>
        !['New', 'Rejected', 'Withdrawn'].includes(a.status)).length, fill: '#6366f1' },
      { name: 'Phỏng vấn', value: filteredApps.filter((a) =>
        ['Interviewing', 'InterviewPassed', 'Offered', 'Hired'].includes(a.status)).length, fill: '#8b5cf6' },
      { name: 'Offer', value: filteredApps.filter((a) =>
        ['Offered', 'Hired'].includes(a.status)).length, fill: '#a855f7' },
      { name: 'Tuyển dụng', value: filteredApps.filter((a) => a.status === 'Hired').length, fill: '#10b981' },
    ];

    const hiredCount = filteredApps.filter((a) => a.status === 'Hired').length;
    const hiringRate = totalApplications > 0 ? ((hiredCount / totalApplications) * 100).toFixed(1) : '0.0';

    // Average time-to-hire
    const hiredApps = filteredApps.filter((a) => a.status === 'Hired' && a.appliedDate);
    const avgTimeToHire = hiredApps.length > 0
      ? Math.round(hiredApps.reduce((sum, a) => {
          const diff = Math.max(1, Math.round((a.appliedDate.getTime() - a.appliedDate.getTime()) / (1000 * 60 * 60 * 24)));
          return sum + diff;
          // Note: actual time-to-hire needs updatedAt; using appliedDate as approximation
        }, 0) / hiredApps.length)
      : null;

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; total: number; hired: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `Tháng ${d.getMonth() + 1}`;
      const monthApps = filteredApps.filter((a) => {
        const ad = a.appliedDate;
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      });
      monthlyTrend.push({
        month: label,
        total: monthApps.length,
        hired: monthApps.filter((a) => a.status === 'Hired').length,
      });
    }

    // Department breakdown
    const deptMap = new Map<string, number>();
    for (const app of filteredApps) {
      const dept = app.jobPosting?.deptName || 'Khác';
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    }
    const deptBreakdown = Array.from(deptMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Growth comparison (this month vs last month)
    const thisMonth = filteredApps.filter((a) => {
      return a.appliedDate.getMonth() === now.getMonth() && a.appliedDate.getFullYear() === now.getFullYear();
    }).length;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = filteredApps.filter((a) => {
      return a.appliedDate.getMonth() === prevDate.getMonth() && a.appliedDate.getFullYear() === prevDate.getFullYear();
    }).length;
    const growthPct = prevMonth === 0
      ? (thisMonth > 0 ? '+100' : '0')
      : `${((thisMonth - prevMonth) / prevMonth * 100) >= 0 ? '+' : ''}${Math.round((thisMonth - prevMonth) / prevMonth * 100)}`;
    const growth = { pct: growthPct, positive: thisMonth >= prevMonth };

    // Unique job titles for filter
    const uniqueJobs = Array.from(new Set(applications.map((a) => a.jobPosting?.title).filter(Boolean)));

    return {
      totalApplications,
      hiredCount,
      hiringRate,
      avgTimeToHire,
      funnel,
      monthlyTrend,
      deptBreakdown,
      growth,
      uniqueJobs,
    };
  }

  /**
   * UC-16: Thống kê tổng hợp cho Director
   */
  async getDirectorStats(filters: { deptFilter?: string }) {
    const now = new Date();

    // All jobs
    const jobsWhere: any = {};
    if (filters.deptFilter && filters.deptFilter !== 'all' && filters.deptFilter !== 'Tất cả') {
      jobsWhere.deptName = filters.deptFilter;
    }
    const jobs = await prisma.jobPosting.findMany({ where: jobsWhere });

    // Open jobs count
    const openJobs = jobs.filter((j) => j.status === 'Open').length;

    // Offers
    const offersWhere: any = {};
    if (filters.deptFilter && filters.deptFilter !== 'all' && filters.deptFilter !== 'Tất cả') {
      offersWhere.application = { jobPosting: { deptName: filters.deptFilter } };
    }
    const offers = await prisma.offer.findMany({
      where: offersWhere,
      include: { application: { include: { jobPosting: true, candidate: true } } },
    });

    const pendingOffers = offers.filter((o) => o.status === 'Pending' || o.status === 'Approved').length;
    const acceptedOffers = offers.filter((o) => o.status === 'Accepted').length;

    // Probations
    const probations = await prisma.probation.findMany({
      where: filters.deptFilter && filters.deptFilter !== 'all' && filters.deptFilter !== 'Tất cả'
        ? { offer: { application: { jobPosting: { deptName: filters.deptFilter } } } }
        : undefined,
      include: {
        probationer: { select: { fullName: true, email: true } },
        supervisor: { select: { fullName: true } },
        evaluation: { select: { status: true, recommendation: true } },
      },
    });

    const activeProbations = probations.filter((p) => !['Pass', 'Fail'].includes(p.status)).length;
    const passedProbations = probations.filter((p) => p.status === 'Pass').length;

    // Monthly hiring trend (last 12 months)
    const monthlyHires: { month: string; joined: number; left: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `T${d.getMonth() + 1}`;

      const monthOffers = offers.filter((o) => {
        if (o.status !== 'Accepted') return false;
        return o.createdAt.getMonth() === d.getMonth() && o.createdAt.getFullYear() === d.getFullYear();
      });

      monthlyHires.push({
        month: label,
        joined: monthOffers.length,
        left: 0, // turnover tracking not yet available
      });
    }

    // Department distribution
    const deptMap = new Map<string, number>();
    for (const job of jobs) {
      deptMap.set(job.deptName, (deptMap.get(job.deptName) || 0) + 1);
    }

    // Offers by department
    const offersByDept = new Map<string, number>();
    for (const offer of offers) {
      const dept = offer.application?.jobPosting?.deptName || 'Khác';
      offersByDept.set(dept, (offersByDept.get(dept) || 0) + 1);
    }

    return {
      overview: {
        openJobs,
        pendingOffers,
        acceptedOffers,
        activeProbations,
        passedProbations,
        totalJobs: jobs.length,
        totalOffers: offers.length,
        totalProbations: probations.length,
      },
      monthlyHires,
      departments: Array.from(deptMap.entries()).map(([name, value]) => ({ name, value })),
      offersByDepartment: Array.from(offersByDept.entries()).map(([name, value]) => ({ name, value })),
    };
  }
}

export const statsService = new StatsService();
