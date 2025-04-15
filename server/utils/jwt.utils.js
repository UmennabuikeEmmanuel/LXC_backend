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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.generateToken = exports.TokenSchema = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const mongoose_1 = require("mongoose");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
// Generate a random secret for token signing
const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
exports.TokenSchema = new mongoose_1.Schema({
    access_token: {
        type: String,
        required: true,
    },
    expires_at: {
        type: String || Number,
    },
    refresh_token: {
        type: String,
        required: true,
    },
}, { versionKey: false });
/**
 * generates JWT used for local testing
 */
const generateToken = (payload, iss) => {
    // read private key value
    const privateKey = fs.readFileSync(path.join(__dirname, "private.key"));
    // Set token expiration times (in seconds)
    const token_expiry = 3600; // 1 hour
    const rt_expiry = token_expiry * 2;
    const signInOptions = {
        // RS256 uses a public/private key pair. The API provides the private key
        // to generate the JWT. The client gets a public key to validate the
        // signature
        algorithm: "RS256",
    };
    const modifiedPayload = {
        iat: Math.floor(Date.now() / 1000) - 30,
        exp: Math.floor(Date.now() / 1000) + token_expiry,
        sub: payload._id,
        iss: iss,
        role: payload.role,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        userType: payload.userType,
        userId: payload._id,
        phoneNumber: payload.phoneNumber,
        businessName: payload.businessName,
        permission: payload.permission,
        jti: (0, crypto_1.randomUUID)(),
        scopes: ["*"],
    };
    // generate JWT
    try {
        const token = (0, jsonwebtoken_1.sign)(modifiedPayload, { key: privateKey, passphrase: secret }, signInOptions);
        const rt = (0, jsonwebtoken_1.sign)({ owner: payload._id, jti: (0, crypto_1.randomUUID)() }, secret, {
            expiresIn: rt_expiry,
        });
        return {
            access_token: token,
            expires_in: token_expiry,
            refresh_token: rt,
        };
    }
    catch (error) {
        return {
            message: "ErrorGeneratingToken",
            error: error,
        };
    }
};
exports.generateToken = generateToken;
/**
 * checks if JWT token is valid
 *
 * @param token the expected token payload
 */
const validateToken = (token) => {
    const publicKey = fs.readFileSync(path.join(__dirname, "public.key"));
    const verifyOptions = {
        algorithms: ["RS256"],
    };
    return new Promise((resolve, reject) => {
        (0, jsonwebtoken_1.verify)(token, publicKey, verifyOptions, (error, decoded) => {
            if (error)
                return reject(error);
            resolve(decoded);
        });
    });
};
exports.validateToken = validateToken;
