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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.checkEditAccess = exports.user = exports.registrar = exports.superadmin = exports.authorize = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
/**
 * middleware to check whether user has access to a specific endpoint
 *
 * @param allowedAccessTypes list of allowed access types of a specific endpoint
 */
const authorize = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let jwt = req.headers.authorization;
        // verify request has token
        if (!jwt) {
            return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
        }
        // remove Bearer if using Bearer Authorization mechanism
        if (jwt.toLowerCase().startsWith('bearer')) {
            jwt = jwt.slice('bearer'.length).trim();
        }
        // verify token hasn't expired yet
        const decodedToken = yield (0, jwt_utils_1.validateToken)(jwt);
        const hasAccessToEndpoint = true;
        if (!hasAccessToEndpoint) {
            return errorHandler_1.default.sendError(res, 403, 'No enough privileges to access endpoint');
        }
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorHandler_1.default.sendError(res, 401, 'Expired token');
        }
        return errorHandler_1.default.sendError(res, 500, 'Failed to authenticate user');
    }
});
exports.authorize = authorize;
const superadmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let jwtToken = req.headers.authorization;
        // verify request has token
        if (!jwtToken) {
            return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
        }
        // remove Bearer if using Bearer Authorization mechanism
        if (jwtToken.toLowerCase().startsWith('bearer')) {
            jwtToken = jwtToken.slice('bearer'.length).trim();
        }
        // Verify and decode the JWT token
        const publicKey = fs_1.default.readFileSync(path.join(__dirname, "./../../../public.key"));
        const pivateKey = fs_1.default.readFileSync(path.join(__dirname, "./../../../public.key"));
        const decodedToken = jsonwebtoken_1.default.verify(jwtToken, publicKey);
        // Check if the decoded token is null
        if (!decodedToken) {
            return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
        }
        // Type assertion to inform TypeScript about the 'user' property
        req.user = decodedToken;
        // Extract the role from the decoded token
        const role = decodedToken.role;
        // Check if the user is a superadmin
        if (role !== 'superadmin') {
            return errorHandler_1.default.sendError(res, 403, 'Access denied. You are not authorized to perform this action');
        }
        // If the user is a superadmin, continue to the next middleware
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorHandler_1.default.sendError(res, 401, 'Expired token');
        }
        return errorHandler_1.default.sendError(res, 500, `Failed to authenticate user: ${error.message}`);
    }
});
exports.superadmin = superadmin;
const registrar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let jwtToken = req.headers.authorization;
        // verify request has token
        if (!jwtToken) {
            return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
        }
        // remove Bearer if using Bearer Authorization mechanism
        if (jwtToken.toLowerCase().startsWith('bearer')) {
            jwtToken = jwtToken.slice('bearer'.length).trim();
        }
        // Verify and decode the JWT token
        const publicKey = fs_1.default.readFileSync(path.join(__dirname, "./../../../public.key"));
        const pivateKey = fs_1.default.readFileSync(path.join(__dirname, "./../../../public.key"));
        const decodedToken = jsonwebtoken_1.default.verify(jwtToken, publicKey);
        // Check if the decoded token is null
        if (!decodedToken) {
            return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
        }
        // Type assertion to inform TypeScript about the 'user' property
        req.user = decodedToken;
        // Extract the role from the decoded token
        const role = decodedToken.role;
        // Check if the user is a registrar
        if (role !== 'registrar') {
            return errorHandler_1.default.sendError(res, 403, 'Access denied. You are not authorized to perform this action');
        }
        // If the user is a registrar, continue to the next middleware
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorHandler_1.default.sendError(res, 401, 'Expired token');
        }
        return errorHandler_1.default.sendError(res, 500, `Failed to authenticate user: ${error.message}`);
    }
});
exports.registrar = registrar;
const user = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let jwtToken = req.headers.authorization;
        // verify request has token
        if (!jwtToken) {
            return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
        }
        // remove Bearer if using Bearer Authorization mechanism
        if (jwtToken.toLowerCase().startsWith('bearer')) {
            jwtToken = jwtToken.slice('bearer'.length).trim();
        }
        // Verify and decode the JWT token
        const publicKey = fs_1.default.readFileSync(path.join(__dirname, "./../../../public.key"));
        const pivateKey = fs_1.default.readFileSync(path.join(__dirname, "./../../../public.key"));
        const decodedToken = jsonwebtoken_1.default.verify(jwtToken, publicKey);
        // Check if the decoded token is null
        if (!decodedToken) {
            return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
        }
        // Type assertion to inform TypeScript about the 'user' property
        req.user = decodedToken;
        // Extract the role from the decoded token
        const role = decodedToken.role;
        // Check if the user is a registrar
        if (role !== 'user') {
            return errorHandler_1.default.sendError(res, 403, 'Access denied. You are not authorized to perform this action');
        }
        // If the user is a registrar, continue to the next middleware
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorHandler_1.default.sendError(res, 401, 'Expired token');
        }
        return errorHandler_1.default.sendError(res, 500, `Failed to authenticate user: ${error.message}`);
    }
});
exports.user = user;
const checkEditAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let jwtToken = req.headers.authorization;
        // Verify request has token
        if (!jwtToken) {
            return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
        }
        // Remove Bearer if using Bearer Authorization mechanism
        if (jwtToken.toLowerCase().startsWith('bearer')) {
            jwtToken = jwtToken.slice('bearer'.length).trim();
        }
        // Verify and decode the JWT token
        const publicKey = fs_1.default.readFileSync(path.join(__dirname, "./../../../public.key"));
        const decodedToken = jsonwebtoken_1.default.verify(jwtToken, publicKey);
        // Check if the decoded token is null
        if (!decodedToken) {
            return errorHandler_1.default.sendError(res, 401, 'Unauthorized');
        }
        // Type assertion to inform TypeScript about the 'user' property
        req.user = decodedToken;
        // Extract the permissions from the decoded token
        const permissions = decodedToken.permission;
        // Check if the user has the required permission for editing
        if (!permissions.includes('Edit access')) {
            return errorHandler_1.default.sendError(res, 403, 'Access denied. You are not authorized to perform this action');
        }
        // If the user has the required permission, continue to the next middleware
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorHandler_1.default.sendError(res, 401, 'Expired token');
        }
        return errorHandler_1.default.sendError(res, 500, `Failed to authenticate user: ${error.message}`);
    }
});
exports.checkEditAccess = checkEditAccess;
