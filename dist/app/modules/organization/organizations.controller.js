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
exports.OrganizationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const organization_service_1 = require("./organization.service");
const getDashboardMatrics = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const result = yield organization_service_1.OrganizaionServices.getDashboardMatrics(userId, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Dashboard all matrics ',
        data: result,
    });
}));
const getOutgoingOrdersByDate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const result = yield organization_service_1.OrganizaionServices.getOutgoingOrdersByDate(userId, role, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Order info retrieve ',
        data: result,
    });
}));
const getIncomingOrdersByDate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const result = yield organization_service_1.OrganizaionServices.getIncomingOrdersByDate(userId, role, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Order info retrieve ',
        data: result,
    });
}));
const updateOrganization = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield organization_service_1.OrganizaionServices.updateOrganization(req, next);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Organization updated ',
        data: result,
    });
}));
const updateOrganizationMembershipCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield organization_service_1.OrganizaionServices.updateOrganizationMembershipCategory(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Organization updated ',
        data: result,
    });
}));
const removePicture = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const result = yield organization_service_1.OrganizaionServices.removePicture(id, role, next);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Organization photo remove ',
        data: result,
    });
}));
const suspendOrganization = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield organization_service_1.OrganizaionServices.suspendOrganization(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Organization suspended ',
        data: result,
    });
}));
exports.OrganizationController = {
    getDashboardMatrics,
    getOutgoingOrdersByDate,
    getIncomingOrdersByDate,
    updateOrganization,
    removePicture,
    updateOrganizationMembershipCategory,
    suspendOrganization,
};
