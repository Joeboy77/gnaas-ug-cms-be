"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailjet = getMailjet;
const node_mailjet_1 = __importDefault(require("node-mailjet"));
function getMailjet() {
    const apiKey = process.env.MAILJET_API_KEY;
    const apiSecret = process.env.MAILJET_API_SECRET;
    if (!apiKey || !apiSecret) {
        throw new Error("MAILJET_API_KEY/MAILJET_API_SECRET missing in env");
    }
    return new node_mailjet_1.default({ apiKey, apiSecret });
}
