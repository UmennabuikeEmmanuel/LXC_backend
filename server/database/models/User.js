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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserById = exports.deleteUserById = exports.createUser = exports.getUserById = exports.getUserBySessionToken = exports.getUserByEmail = exports.getUsers = exports.UserPermission = exports.UserStatus = exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
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
    UserPermission["VALID"] = "valid";
    UserPermission["INVALID"] = "invalid";
})(UserPermission || (exports.UserPermission = UserPermission = {}));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: false },
    email: { type: String, required: true, unique: true },
    photo: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    lastLogin: { type: Date, default: Date.now },
    authentication: {
        password: { type: String, required: true, select: false },
        salt: { type: String, select: false },
        sessionToken: { type: String, select: false },
    },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    permission: { type: String, enum: Object.values(UserPermission), default: UserPermission.VALID },
}, { timestamps: true });
const UserModel = mongoose_1.default.model('User', userSchema);
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () { return UserModel.find().lean(); });
exports.getUsers = getUsers;
const getUserByEmail = (email) => UserModel.findOne({ email: { $regex: new RegExp(email, 'i') } });
exports.getUserByEmail = getUserByEmail;
const getUserBySessionToken = (sessionToken) => UserModel.findOne({ 'authentication.sessionToken': sessionToken });
exports.getUserBySessionToken = getUserBySessionToken;
const getUserById = (id) => UserModel.findById(id);
exports.getUserById = getUserById;
const createUser = (values) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new UserModel(values);
    try {
        return yield user.save();
    }
    catch (error) {
        throw new Error(`Failed to create user: ${error.message}`);
    }
});
exports.createUser = createUser;
const deleteUserById = (id) => UserModel.findOneAndDelete({ _id: id });
exports.deleteUserById = deleteUserById;
const updateUserById = (id, values) => UserModel.findByIdAndUpdate(id, values);
exports.updateUserById = updateUserById;
exports.default = UserModel;
