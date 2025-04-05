"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDbConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const checkDbConnection = () => (req, res, next) => {
    if (mongoose_1.default.connection.readyState === 1) {
        next();
    }
    else {
        if (!res.headersSent && req.path.match(/(api)/))
            res.status(500).json({
                message: "DB connection failed or DB not connected"
            });
        res.end();
    }
};
exports.checkDbConnection = checkDbConnection;
