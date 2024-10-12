"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCronJobs = void 0;
// src/app/modules/cron/cron.service.ts
const node_cron_1 = __importDefault(require("node-cron"));
const cron_config_1 = require("./cron.config");
const cron_jobs_1 = require("./cron.jobs");
const initializeCronJobs = () => {
    // Daily task
    node_cron_1.default.schedule(cron_config_1.cronJobsConfig.dailyTask, () => {
        console.log('Running daily task');
        (0, cron_jobs_1.runDailyTask)();
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
exports.initializeCronJobs = initializeCronJobs;
