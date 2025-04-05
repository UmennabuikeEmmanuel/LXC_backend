"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorHandler {
    static sendResponse(res, statusCode, message, success) {
        const response = { success, message, statusCode };
        res.status(statusCode).json(response);
    }
    static sendError(res, statusCode, message) {
        this.sendResponse(res, statusCode, message, false);
    }
    static sendSuccess(res, statusCode, message) {
        this.sendResponse(res, statusCode, message, true);
    }
    static notFound(res, message = 'Not Found') {
        this.sendError(res, 404, message);
    }
    static badRequest(res, message = 'Bad Request') {
        this.sendError(res, 400, message);
    }
    static internalServerError(res, message = 'Internal Server Error') {
        this.sendError(res, 500, message);
    }
}
exports.default = ErrorHandler;
