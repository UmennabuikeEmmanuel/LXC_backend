"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.isSuperadmin = exports.isAuth = exports.isRegistrar = exports.isAuthenticated = exports.isOwner = void 0;
__exportStar(require("./auth.middleware"), exports);
__exportStar(require("./logging.middleware"), exports);
__exportStar(require("./db.middleware"), exports);
__exportStar(require("./cors.middleware"), exports);
const lodash_1 = require("lodash");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = require("../db/users");
const isOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const currentUserId = (0, lodash_1.get)(req, 'identity._id');
        if (!currentUserId) {
            return res.sendStatus(403);
        }
        if (currentUserId.toString() !== id) {
            return res.sendStatus(403);
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.isOwner = isOwner;
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionToken = req.cookies['ANTONIO-AUTH'];
        if (!sessionToken) {
            return errorHandler_1.default.sendError(res, 403, 'You need to login');
            //return res.sendStatus(403);
        }
        const existingUser = yield (0, users_1.getUserBySessionToken)(sessionToken);
        if (!existingUser) {
            return res.sendStatus(403);
        }
        (0, lodash_1.merge)(req, { identity: existingUser });
        return next();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.isAuthenticated = isAuthenticated;
const isRegistrar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionToken = req.cookies['ANTONIO-AUTH'];
        if (!sessionToken) {
            return errorHandler_1.default.sendError(res, 403, 'You need to login');
        }
        const existingUser = yield (0, users_1.getUserBySessionToken)(sessionToken);
        if (existingUser) {
            // Check if the user has the superadmin role
            if (existingUser.role !== 'registrar') {
                return errorHandler_1.default.sendError(res, 403, 'You are not authorized to perform this action');
            }
            (0, lodash_1.merge)(req, { identity: existingUser });
            return next();
        }
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.isRegistrar = isRegistrar;
const isAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the Authorization header
    if (!token) {
        return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
    }
    jsonwebtoken_1.default.verify(token, "lispedes001@", (err, decoded) => {
        if (err) {
            return errorHandler_1.default.sendError(res, 403, 'Token is not valid');
        }
        req.userId = decoded.userId;
        next();
    });
};
exports.isAuth = isAuth;
const isSuperadmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the Authorization header
    if (!token) {
        return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
    }
    jsonwebtoken_1.default.verify(token, "lispedes001@", (err, decoded) => {
        if (err) {
            return errorHandler_1.default.sendError(res, 403, 'Token is not valid');
        }
        req.userId = decoded.userId;
        // Check if the user is a superadmin
        if (decoded.role !== 'superadmin') {
            return errorHandler_1.default.sendError(res, 403, 'Access denied. Only superadmins are allowed.');
        }
        next();
    });
};
exports.isSuperadmin = isSuperadmin;
