// src/app/modules/cron/cron.service.ts
import cron from 'node-cron';
import { cronJobsConfig } from './cron.config';
import { runDailyTask } from './cron.jobs';
export const initializeCronJobs = () => {
  // Daily task
  cron.schedule(cronJobsConfig.dailyTask, () => {
    console.log('Running daily task');
    runDailyTask();
  });

  // Weekly task
  //   cron.schedule(cronJobsConfig.weeklyTask, () => {
  //     console.log('Running weekly task');
  //     // runWeeklyTask();
  //   });

  // Hourly task
  //   cron.schedule(cronJobsConfig.hourlyTask, () => {
  //     console.log('Running hourly task');
  //     // runHourlyTask();
  //   });
};
