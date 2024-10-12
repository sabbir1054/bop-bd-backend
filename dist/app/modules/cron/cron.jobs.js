"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHourlyTask = exports.runWeeklyTask = exports.runDailyTask = void 0;
const deadlinePayCommission_service_1 = require("../deadlinePayCommission/deadlinePayCommission.service");
const runDailyTask = () => __awaiter(void 0, void 0, void 0, function* () {
    // Your daily task logic here
    yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.suspendOrganizations();
    console.log('Daily task completed');
});
exports.runDailyTask = runDailyTask;
const runWeeklyTask = () => __awaiter(void 0, void 0, void 0, function* () {
    // Your weekly task logic here
    //   console.log('Weekly task completed');
});
exports.runWeeklyTask = runWeeklyTask;
const runHourlyTask = () => __awaiter(void 0, void 0, void 0, function* () {
    // Your hourly task logic here
    //   console.log('Hourly task completed');
});
exports.runHourlyTask = runHourlyTask;
