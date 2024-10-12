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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlinePayCommissionServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createNew = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.deadlinePayCommission.findUnique({
        where: {
            memberCategory: payload.memberCategory,
        },
    });
    if (isExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Deadline for the member category alredyexist, now edit it');
    }
    const result = yield prisma_1.default.deadlinePayCommission.create({
        data: payload,
    });
    return result;
});
const getAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.deadlinePayCommission.findMany();
    return result;
});
const updateSingle = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.deadlinePayCommission.findMany({
        where: { id: id },
    });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Deadline not found, create first !');
    }
    const result = yield prisma_1.default.deadlinePayCommission.update({
        where: { id: id },
        data: Object.assign({}, payload),
    });
    return result;
});
const deleteSingle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.deadlinePayCommission.findMany({
        where: { id: id },
    });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Deadline not found, create first !');
    }
    const result = yield prisma_1.default.deadlinePayCommission.delete({
        where: { id: id },
    });
    return result;
});
const getSingle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.deadlinePayCommission.findMany({
        where: { id: id },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Deadline not found, create first !');
    }
    return result;
});
const extendDeadlineRequest = (userId, userRole, comment) => __awaiter(void 0, void 0, void 0, function* () {
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!isValidStaff || !isValidStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid staff user id');
        }
        if (isValidStaff.role !== 'STAFF_ADMIN') {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You are not able to request');
        }
        orgId = isValidStaff.organizationId;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid user  id');
        }
        orgId = userInfo.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const result = yield prisma_1.default.requestExtendDeadline.create({
        data: { organizationId: orgId, comment: comment },
    });
    return result;
});
const handleDeadlineRequest = (requestId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isRequestExist = yield prisma_1.default.requestExtendDeadline.findUnique({
        where: { id: requestId },
        include: { organization: true },
    });
    if (!isRequestExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Request is not found');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const handlerequest = yield prisma.requestExtendDeadline.update({
            where: { id: requestId },
            data: {
                requestStatus: (payload === null || payload === void 0 ? void 0 : payload.updatedStatus)
                    ? payload.updatedStatus
                    : isRequestExist.requestStatus,
                isResolved: true,
            },
        });
        const updateExtendDays = yield prisma.organization.update({
            where: { id: isRequestExist.organizationId },
            data: {
                deadlineExtendfor: (payload === null || payload === void 0 ? void 0 : payload.extendDays)
                    ? payload.extendDays
                    : isRequestExist.organization.deadlineExtendfor,
            },
        });
        return Object.assign(Object.assign({}, handleDeadlineRequest), { extededDays: updateExtendDays.deadlineExtendfor });
    }));
    return result;
});
const updateMyRequest = (userId, userRole, requestId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.extendDays) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You cant not set exted days');
    }
    const isRequestExist = yield prisma_1.default.requestExtendDeadline.findUnique({
        where: { id: requestId },
        include: { organization: true },
    });
    if (!isRequestExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Request is not found');
    }
    if (isRequestExist.isResolved) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Request is alredy resolved');
    }
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!isValidStaff || !isValidStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid staff user id');
        }
        if (isValidStaff.role !== 'STAFF_ADMIN') {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You are not able to request');
        }
        orgId = isValidStaff.organizationId;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid user  id');
        }
        orgId = userInfo.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    if (isRequestExist.organizationId !== orgId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid request id');
    }
    const result = yield prisma_1.default.requestExtendDeadline.update({
        where: { id: requestId },
        data: {
            comment: (payload === null || payload === void 0 ? void 0 : payload.comment) ? payload.comment : isRequestExist.comment,
            requestStatus: (payload === null || payload === void 0 ? void 0 : payload.updatedStatus)
                ? payload.updatedStatus
                : isRequestExist.requestStatus,
        },
    });
    return result;
});
const getAllDeadlineExtendRequest = (userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
        const result = yield prisma_1.default.requestExtendDeadline.findMany();
        return result;
    }
    else {
        let orgId = null;
        if (userRole === 'STAFF') {
            const isValidStaff = yield prisma_1.default.staff.findUnique({
                where: { staffInfoId: userId },
            });
            if (!isValidStaff || !isValidStaff.isValidNow) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid staff user id');
            }
            if (isValidStaff.role !== 'STAFF_ADMIN') {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You are not able to request');
            }
            orgId = isValidStaff.organizationId;
        }
        else {
            const userInfo = yield prisma_1.default.user.findUnique({
                where: { id: userId },
            });
            if (!userInfo) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid user  id');
            }
            orgId = userInfo.organizationId;
        }
        if (!orgId) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
        }
        const result = yield prisma_1.default.requestExtendDeadline.findMany({
            where: {
                organizationId: orgId,
            },
        });
        return result;
    }
});
const getSingleRequest = (userId, userRole, requestId) => __awaiter(void 0, void 0, void 0, function* () {
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
        const result = yield prisma_1.default.requestExtendDeadline.findUnique({
            where: { id: requestId },
        });
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Request not found');
        }
        return result;
    }
    else {
        let orgId = null;
        if (userRole === 'STAFF') {
            const isValidStaff = yield prisma_1.default.staff.findUnique({
                where: { staffInfoId: userId },
            });
            if (!isValidStaff || !isValidStaff.isValidNow) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid staff user id');
            }
            if (isValidStaff.role !== 'STAFF_ADMIN') {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You are not able to request');
            }
            orgId = isValidStaff.organizationId;
        }
        else {
            const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
            if (!userInfo) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid user  id');
            }
            orgId = userInfo.organizationId;
        }
        if (!orgId) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
        }
        const result = yield prisma_1.default.requestExtendDeadline.findUnique({
            where: { id: requestId },
        });
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Request not found');
        }
        if (result.organizationId !== orgId) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Request not found in your organization');
        }
        return result;
    }
});
//? cron jobs
// const suspendOrganizations = async () => {
//   const fixedDaysAgo = new Date();
//   const result = await prisma.$transaction(async prisma => {
//     //* get all kind of deadline
//     const getAllDeadline = await prisma.deadlinePayCommission.findMany();
//     getAllDeadline.map(async deadline => {
//       fixedDaysAgo.setDate(
//         fixedDaysAgo.getDate() - parseInt(deadline.deadline),
//       );
//       const isDueExist = await prisma.organization.updateMany({
//         where: {
//           AND: [
//             { memberShipCategory: deadline.memberCategory },
//             { totalCommission: { gt: 0 } },
//             {
//               PayCommission: {
//                 some: {
//                   updatedAt: {
//                     gte: fixedDaysAgo, // Checks if updatedAt is within the last 10 days
//                   },
//                 },
//               },
//             },
//           ],
//         },
//         data: {
//           isSuspend: true,
//         },
//       });
//     });
//   });
// };
const suspendOrganizations = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Get all kinds of deadlines
        const getAllDeadline = yield prisma.deadlinePayCommission.findMany();
        // Loop through each deadline and process accordingly
        for (const deadline of getAllDeadline) {
            // Find organizations with unpaid commissions and consider deadlineExtendFor
            const organizations = yield prisma.organization.findMany({
                where: {
                    memberShipCategory: deadline.memberCategory,
                    totalCommission: { gt: 0 },
                    isSuspend: false, // Only active organizations
                },
                select: {
                    id: true,
                    deadlineExtendfor: true, // We need this for calculating adjusted deadline
                    PayCommission: {
                        select: {
                            updatedAt: true,
                        },
                        orderBy: {
                            updatedAt: 'desc',
                        },
                        take: 1, // Get the latest payment commission date
                    },
                },
            });
            for (const org of organizations) {
                // Calculate the adjusted deadline with extended days
                const fixedDaysAgo = new Date();
                const totalDeadlineDays = parseInt(deadline.deadline) + (org.deadlineExtendfor || 0); // Sum of original deadline + extended days
                fixedDaysAgo.setDate(fixedDaysAgo.getDate() - totalDeadlineDays);
                // Check if the latest payment commission was before the adjusted deadline
                const latestCommission = org.PayCommission[0];
                if (latestCommission && latestCommission.updatedAt < fixedDaysAgo) {
                    // Suspend the organization if it hasn't paid within the adjusted deadline
                    yield prisma.organization.update({
                        where: { id: org.id },
                        data: { isSuspend: true },
                    });
                }
            }
        }
    }));
    return result;
});
exports.DeadlinePayCommissionServices = {
    createNew,
    getAll,
    updateSingle,
    deleteSingle,
    getSingle,
    extendDeadlineRequest,
    handleDeadlineRequest,
    getSingleRequest,
    getAllDeadlineExtendRequest,
    updateMyRequest,
    suspendOrganizations,
};
