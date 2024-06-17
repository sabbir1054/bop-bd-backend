"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPasswordStrength = void 0;
const checkPasswordStrength = (phone, password) => {
    // Check if password is at least 8 characters long
    if (password.length < 8) {
        return {
            validity: false,
            msg: 'Password must be at least 8 characters long.',
        };
    }
    // Check if password contains any similarity with the phone
    if (phone.includes(password)) {
        return {
            validity: false,
            msg: 'Password cannot be similar to your phone number.',
        };
    }
    // Check password strength (you can add more conditions as needed)
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasDigits = /\d/.test(password);
    // const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    // console.log(hasUpperCase,hasLowerCase,hasDigits);
    // if (hasUpperCase && hasLowerCase && hasDigits ) {
    return { validity: true, msg: 'Password is strong.' };
    // } else {
    //   return {
    //     validity: false,
    //     msg: 'Password is weak. It should contain at least one uppercase letter, one lowercase letter and one digit.',
    //   };
    // }
};
exports.checkPasswordStrength = checkPasswordStrength;
