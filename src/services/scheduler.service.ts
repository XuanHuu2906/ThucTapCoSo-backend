import cron from 'node-cron';
import { prisma } from '../config/prisma.js';
import { probationRepository } from '../repositories/probation.repository.js';
import { emailService } from './email.service.js';
import { notificationEmitter } from '../events/notification.events.js';

/**
 * UC-12: Khởi tạo các scheduled tasks
 * - Quét hàng ngày và gửi email nhắc nhở cho HM khi probation sắp hết hạn (7 ngày)
 */
export const startScheduler = () => {
  // Chạy mỗi ngày lúc 8:00 sáng
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Checking probations ending soon...');
    try {
      const probations = await probationRepository.findEndingSoon(7);

      if (probations.length === 0) {
        console.log('[Scheduler] No probations ending soon.');
        return;
      }

      console.log(`[Scheduler] Found ${probations.length} probations ending soon.`);

      for (const probation of probations) {
        const daysLeft = Math.ceil((new Date(probation.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        
        // Gửi email cho supervisor (Hiring Manager)
        if (probation.supervisor?.email) {
          await emailService.sendProbationReminder(
            probation.supervisor.email,
            probation.supervisor.fullName,
            probation.probationer.fullName,
            probation.endDate,
          );
          notificationEmitter.emit('probation.evaluation_reminder', { probation, hmId: probation.supervisorId, daysLeft });
          console.log(`[Scheduler] Reminder sent to HM ${probation.supervisor.email} for ${probation.probationer.fullName}`);
        }

        // Gửi email cho Recruiter phụ trách (nếu tìm thấy)
        const postedBy = probation.offer?.application?.jobPosting?.postedBy;
        if (postedBy) {
          try {
            const recruiter = await prisma.user.findUnique({
              where: { userId: postedBy },
              select: { email: true, fullName: true },
            });
            if (recruiter?.email) {
              await emailService.sendProbationReminder(
                recruiter.email,
                recruiter.fullName,
                probation.probationer.fullName,
                probation.endDate,
              );
              notificationEmitter.emit('probation.reminder_due', { probation, recruiterId: postedBy, daysLeft });
              console.log(`[Scheduler] CC reminder sent to Recruiter ${recruiter.email}`);
            }
          } catch (err) {
            console.error(`[Scheduler] Failed to notify recruiter for probation ${probation.probationId}:`, err);
          }
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error checking probations:', error);
    }

    console.log('[Scheduler] Checking interviews needing evaluation...');
    try {
      // Find interviews in the past that have result == 'Pending' and confirmStatus == 'Confirmed'
      const pendingInterviews = await prisma.interview.findMany({
        where: {
          result: 'Pending',
          confirmStatus: 'Confirmed',
          interviewDate: {
            lt: new Date()
          }
        }
      });

      console.log(`[Scheduler] Found ${pendingInterviews.length} pending interviews for evaluation.`);
      for (const interview of pendingInterviews) {
        notificationEmitter.emit('interview.evaluation_reminder', { interview });
      }
    } catch (error) {
      console.error('[Scheduler] Error checking interviews:', error);
    }
  });

  console.log('[Scheduler] Daily probation reminder scheduled at 8:00 AM');
};
