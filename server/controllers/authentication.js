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
exports.resetPassword = exports.requestPasswordReset = exports.verify = exports.logout = exports.businessRegister = exports.register = exports.login = void 0;
const users_1 = require("../db/users");
const helpers_1 = require("../helpers");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const SuccessHandler_1 = __importDefault(require("../utils/SuccessHandler"));
const joi_1 = __importDefault(require("joi"));
const dotenv_1 = __importDefault(require("dotenv"));
const jwt_utils_1 = require("../utils/jwt.utils");
const users_2 = __importDefault(require("../db/users"));
const crypto_1 = require("crypto");
const mail_1 = require("../mail/mail");
dotenv_1.default.config();
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate user input
        const loginSchema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required(),
        });
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { email, password } = req.body;
        const user = yield (0, users_1.getUserByEmail)(email).select('+authentication.salt +authentication.password +status');
        if (!user) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid login credentials');
        }
        if (!user.isVerified) {
            return errorHandler_1.default.sendError(res, 403, 'Email is not verified');
        }
        if (!user.status || user.status !== 'active') {
            return errorHandler_1.default.sendError(res, 403, 'Account is inactive. Please contact support.');
        }
        const salt = user.authentication.salt || '';
        const hashedPassword = (0, helpers_1.authentication)(salt, password);
        if (user.authentication.password !== hashedPassword) {
            return errorHandler_1.default.sendError(res, 403, 'Invalid login credentials');
        }
        const userPayload = {
            _id: user._id,
            email: user.email,
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            userType: user.userType,
            phoneNumber: user.phoneNumber || '',
            businessName: user.businessName,
            permission: Object.values(user.permission),
        };
        const token = (0, jwt_utils_1.generateToken)(userPayload, 'your_iss');
        if (!token) {
            return errorHandler_1.default.sendError(res, 500, 'Token generation failed');
        }
        res.cookie('token', token, { httpOnly: true });
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Logged successfully', { user, token });
    }
    catch (error) {
        console.error('Error during login:', error);
        return errorHandler_1.default.sendError(res, 500, 'Internal server error');
    }
});
exports.login = login;
//Individual User Registration
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate user input
        const schema = joi_1.default.object({
            firstName: joi_1.default.string().required(),
            lastName: joi_1.default.string().required(),
            phoneNumber: joi_1.default.string(),
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        // Check if user already exists
        const { firstName, lastName, phoneNumber, email, password } = req.body;
        const existingUser = yield (0, users_1.getUserByEmail)(email);
        if (existingUser) {
            return errorHandler_1.default.sendError(res, 400, 'User with this email already exists');
        }
        // Generate salt and hash password
        const salt = (0, helpers_1.random)();
        const hashedPassword = (0, helpers_1.authentication)(salt, password);
        // Create new user
        const newUser = {
            firstName,
            lastName,
            phoneNumber,
            email,
            userType: "Individual",
            authentication: {
                salt,
                password: hashedPassword,
            },
        };
        const user = yield (0, users_1.createUser)(newUser);
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Verification email sent successfully');
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.register = register;
//Business or company registration
const businessRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate user input
        const schema = joi_1.default.object({
            businessName: joi_1.default.string().required(),
            phoneNumber: joi_1.default.string(),
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        // Check if user already exists
        const { businessName, phoneNumber, email, password } = req.body;
        const existingUser = yield (0, users_1.getUserByEmail)(email);
        if (existingUser) {
            return errorHandler_1.default.sendError(res, 400, 'This email already exists');
        }
        // Generate salt and hash password
        const salt = (0, helpers_1.random)();
        const hashedPassword = (0, helpers_1.authentication)(salt, password);
        // Create new user
        const newUser = {
            businessName,
            phoneNumber,
            email,
            userType: "Business",
            authentication: {
                salt,
                password: hashedPassword,
            },
        };
        const user = yield (0, users_1.createUser)(newUser);
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Verification email sent successfully');
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.businessRegister = businessRegister;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear JWT token from client's browser
        res.clearCookie('token');
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Logged out successfully');
    }
    catch (error) {
        console.error('Error during logout:', error);
        return res.sendStatus(400);
    }
});
exports.logout = logout;
//Verify user or company account
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const user = yield (0, users_1.getUserByVerificationToken)(token);
        if (!user) {
            return res.status(404).json({ error: 'Invalid or expired verification token' });
        }
        // Update user verification status and token
        const updatedUser = yield (0, users_1.updateUserById)(user._id, { isVerified: true, verificationToken: null });
        if (!updatedUser) {
            throw new Error('Failed to update user');
        }
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Email verified successfully');
    }
    catch (error) {
        console.error('Error verifying account:', error);
        res.status(500).json({ error: 'Failed to verify account' });
    }
});
exports.verify = verify;
//Request password reset
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { email } = req.body;
        const user = yield users_2.default.findOne({ email });
        if (!user) {
            return errorHandler_1.default.sendError(res, 404, 'User with this email does not exist');
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
        yield user.save();
        yield (0, mail_1.sendResetPassword)(user.email, token);
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Password reset email sent successfully');
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.requestPasswordReset = requestPasswordReset;
//Reset password now
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            token: joi_1.default.string().required(),
            password: joi_1.default.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { token, password } = req.body;
        const user = yield users_2.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return errorHandler_1.default.sendError(res, 400, 'Password reset token is invalid or has expired');
        }
        const salt = (0, helpers_1.random)();
        const hashedPassword = (0, helpers_1.authentication)(salt, password);
        user.authentication = {
            salt,
            password: hashedPassword,
        };
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Password has been reset successfully');
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.resetPassword = resetPassword;
