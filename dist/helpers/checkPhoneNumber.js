"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPhoneNumberFormate = void 0;
const checkPhoneNumberFormate = (phone) => {
    if (phone.length !== 11) {
        return false;
    }
    if (!phone.startsWith('01')) {
        return false;
    }
    if (!/^[0-9]+$/.test(phone)) {
        return false;
    }
    return true;
};
exports.checkPhoneNumberFormate = checkPhoneNumberFormate;
