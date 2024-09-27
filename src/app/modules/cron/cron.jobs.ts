import { DeadlinePayCommissionServices } from '../deadlinePayCommission/deadlinePayCommission.service';

export const runDailyTask = async () => {
  // Your daily task logic here
  await DeadlinePayCommissionServices.suspendOrganizations();
  console.log('Daily task completed');
};

export const runWeeklyTask = async () => {
  // Your weekly task logic here
  //   console.log('Weekly task completed');
};

export const runHourlyTask = async () => {
  // Your hourly task logic here
  //   console.log('Hourly task completed');
};
