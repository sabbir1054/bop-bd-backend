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
exports.startExecutePayment = exports.startCreatePayment = exports.startGrantToken = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const startGrantToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const grantToke = config_1.default.bkashConfig.grantTokenLink;
    const response = yield axios_1.default.post(`${grantToke}`, {
        app_key: config_1.default.bkashConfig.appKey,
        app_secret: config_1.default.bkashConfig.appSecretKey,
    }, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            username: config_1.default.bkashConfig.username,
            password: config_1.default.bkashConfig.password,
        },
    });
    return response;
});
exports.startGrantToken = startGrantToken;
const startCreatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createPaymentLink = config_1.default.bkashConfig.createPaymentLink;
    const requestBody = {
        mode: '0011',
        payerReference: payload.orgId,
        callbackURL: payload.callbackUrl,
        amount: payload.amount,
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: payload.orgId,
    };
    const response = yield axios_1.default.post(`${createPaymentLink}`, Object.assign({}, requestBody), {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: payload.id_token,
            'X-App-Key': config_1.default.bkashConfig.appKey,
        },
    });
    return response;
});
exports.startCreatePayment = startCreatePayment;
const startExecutePayment = (paymentID, id_token) => __awaiter(void 0, void 0, void 0, function* () {
    const executePaymentLink = config_1.default.bkashConfig.executePaymentLink;
    const response = yield axios_1.default.post(`${executePaymentLink}`, {
        paymentID: paymentID,
    }, {
        headers: {
            Accept: 'application/json',
            Authorization: id_token,
            'X-App-Key': config_1.default.bkashConfig.appKey,
        },
    });
    return response;
});
exports.startExecutePayment = startExecutePayment;
