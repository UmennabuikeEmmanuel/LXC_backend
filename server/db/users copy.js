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
exports.getUserByVerificationToken = exports.updateUserById = exports.deleteUserById = exports.getUserById = exports.getUserBySessionToken = exports.getUserByEmail = exports.getUsers = exports.createUser = exports.createGuestUser = exports.UserPermission = exports.UserStatus = exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = require("crypto");
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["SUPERADMIN"] = "superadmin";
    UserRole["REGISTRAR"] = "registrar";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var UserPermission;
(function (UserPermission) {
    UserPermission["UPLOAD_ACCESS"] = "Upload access";
    UserPermission["EDIT_ACCESS"] = "Edit access";
    UserPermission["DELETE_ACCESS"] = "Delete access";
})(UserPermission || (exports.UserPermission = UserPermission = {}));
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    userType: { type: String, required: true },
    businessName: { type: String, required: false },
    courtName: { type: String },
    judicialDivision: { type: String },
    courtRoomNo: { type: String },
    lastLogin: { type: Date, default: Date.now },
    authentication: {
        password: { type: String, required: true, select: false },
        salt: { type: String, select: false },
        sessionToken: { type: String, select: false },
    },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    permission: [{ type: String, enum: Object.values(UserPermission) }],
    isVerified: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    verificationToken: { type: String },
    photoUrl: { type: String, required: false },
    registrarSeal: { type: String, required: false },
    registrarSignature: { type: String, required: false },
}, { timestamps: true });
const UserModel = mongoose_1.default.model('User', userSchema);
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'alkasima5050@gmail.com',
        pass: 'dtwfhgprxxbwhwjm',
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const sendVerificationEmail = (email, verificationToken) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: 'alkasima5050@gmail.com', // sender address
        to: email,
        subject: 'Email Verification',
        html: `<p>Please click <a href="https://lispendes-dev.fly.dev/auth/verify/${verificationToken}">here</a> to verify your email address.</p>`,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
});
const createGuestUser = (values) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = values;
    const newUser = Object.assign(Object.assign({}, values), { isVerified: true });
    try {
        const user = yield new UserModel(newUser).save();
        return user; // Return the created user object
    }
    catch (error) {
        throw new Error(`Failed to create user: ${error}`);
    }
});
exports.createGuestUser = createGuestUser;
const createUser = (values) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = values;
    const verificationToken = generateVerificationToken();
    const newUser = Object.assign(Object.assign({}, values), { isVerified: false, verificationToken });
    try {
        yield sendVerificationEmail(email, verificationToken);
        return yield new UserModel(newUser).save();
    }
    catch (error) {
        throw new Error(`Failed to create user: ${error}`);
    }
});
exports.createUser = createUser;
const generateVerificationToken = () => {
    return (0, crypto_1.randomBytes)(32).toString('hex');
};
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () { return UserModel.find().lean(); });
exports.getUsers = getUsers;
const getUserByEmail = (email) => UserModel.findOne({ email: { $regex: new RegExp(email, 'i') } });
exports.getUserByEmail = getUserByEmail;
const getUserBySessionToken = (sessionToken) => UserModel.findOne({ 'authentication.sessionToken': sessionToken });
exports.getUserBySessionToken = getUserBySessionToken;
const getUserById = (id) => UserModel.findById(id);
exports.getUserById = getUserById;
const deleteUserById = (id) => UserModel.findOneAndDelete({ _id: id });
exports.deleteUserById = deleteUserById;
const updateUserById = (id, values) => UserModel.findByIdAndUpdate(id, values);
exports.updateUserById = updateUserById;
const getUserByVerificationToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserModel.findOne({ verificationToken: token });
        return user;
    }
    catch (error) {
        console.error('Error finding user by verification token:', error);
        throw new Error('Failed to find user by verification token');
    }
});
exports.getUserByVerificationToken = getUserByVerificationToken;
exports.default = UserModel;
