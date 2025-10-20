"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmail = isEmail;
function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
