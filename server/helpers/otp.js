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
exports.verifyOTP = void 0;
const otp_1 = __importDefault(require("../db/otp"));
/**
 * Verify OTP provided by the user.
 * @param userId The ID of the user.
 * @param otp The OTP provided by the user.
 * @returns A Promise that resolves to true if the OTP is valid, and false otherwise.
 */
const verifyOTP = (userId, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the OTP document for the user
        const otpDocument = yield otp_1.default.findOne({ user: userId }).sort({ createdAt: -1 });
        // Check if OTP document exists and the OTP matches
        if (otpDocument && otpDocument.otp === otp) {
            // Check if OTP has not expired
            if (otpDocument.expiry > new Date()) {
                return true; // OTP is valid
            }
        }
        return false; // OTP is invalid or expired
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        return false; // Error occurred, consider OTP invalid
    }
});
exports.verifyOTP = verifyOTP;
