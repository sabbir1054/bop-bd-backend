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
exports.DeadlinePayCommissionController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const deadlinePayCommission_service_1 = require("./deadlinePayCommission.service");
const create = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.createNew(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Deadline created created',
        data: result,
    });
}));
const getAll = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.getAll();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Deadline retrieve',
        data: result,
    });
}));
const updatedSingle = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.updateSingle(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Deadline updated',
        data: result,
    });
}));
const deleteSingle = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.deleteSingle(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Deadline deleted',
        data: result,
    });
}));
const getSingle = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.getSingle(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Deadline retrieve',
        data: result,
    });
}));
const extendDeadlineRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.extendDeadlineRequest(id, role, req.body.comment);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Deadline extend request sent',
        data: result,
    });
}));
const handleDeadlineRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.handleDeadlineRequest(requestId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Handle deadline extend request sent',
        data: result,
    });
}));
const updateMyRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const { id, role } = req.user;
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.updateMyRequest(id, role, requestId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Updated request',
        data: result,
    });
}));
const getAllDeadlineExtendRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.getAllDeadlineExtendRequest(id, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Request retrieve',
        data: result,
    });
}));
const getSingleRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const { id, role } = req.user;
    const result = yield deadlinePayCommission_service_1.DeadlinePayCommissionServices.getSingleRequest(id, role, requestId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Request retrieve',
        data: result,
    });
}));
exports.DeadlinePayCommissionController = {
    create,
    getAll,
    updatedSingle,
    deleteSingle,
    getSingle,
    extendDeadlineRequest,
    handleDeadlineRequest,
    updateMyRequest,
    getAllDeadlineExtendRequest,
    getSingleRequest,
};
