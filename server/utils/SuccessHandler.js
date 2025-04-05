"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SuccessHandler {
    static sendSuccess(res, statusCode, message, data) {
        const response = { success: true, message, data, statusCode };
        res.status(statusCode).json(response);
    }
    static sendCustomSuccess(res, statusCode, message, data) {
        this.sendSuccess(res, statusCode, message, data);
    }
}
exports.default = SuccessHandler;
