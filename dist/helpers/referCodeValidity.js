"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCodeValid = void 0;
const isCodeValid = (validUntil) => {
    const today = new Date();
    // Check if validUntil is in the future
    return validUntil > today;
};
exports.isCodeValid = isCodeValid;
