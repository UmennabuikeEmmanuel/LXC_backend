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
exports.registrarUsers = exports.createCourtRecord = exports.getRegistrarSetting = exports.getUser = exports.getAllUsers = exports.updateUser = exports.deleteUser = exports.addNewUser2 = exports.addNewUser = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const users_1 = require("../db/users");
const SuccessHandler_1 = __importDefault(require("../utils/SuccessHandler"));
const helpers_1 = require("../helpers");
const users_2 = __importDefault(require("../db/users"));
const users_3 = require("../db/users");
const mongoose_1 = __importDefault(require("mongoose"));
const settings_1 = __importDefault(require("../db/settings"));
const activityLog_1 = __importDefault(require("../db/activityLog"));
const users_4 = require("../db/users");
const cloudinaryConfig_1 = __importDefault(require("../config/cloudinaryConfig"));
const multer_1 = __importDefault(require("multer"));
//Create new user
const addNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        upload.fields([{ name: 'registrarSeal' }, { name: 'registrarSignature' }])(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return errorHandler_1.default.sendError(res, 400, err.message);
            }
            const { firstName, lastName, email, password, courtName, judicialDivision, courtRoomNo, role, status, isAcr } = req.body;
            let { permission } = req.body;
            if (!Array.isArray(permission)) {
                if (typeof permission === 'string') {
                    permission = permission.split(',').map(p => p.trim());
                }
                else {
                    permission = [];
                }
            }
            const existingUser = yield (0, users_1.getUserByEmail)(email);
            if (existingUser) {
                return errorHandler_1.default.sendError(res, 400, 'User with this email already exists');
            }
            if (isAcr === 'true') {
                const existingAcrRegistrar = yield users_2.default.findOne({
                    judicialDivision,
                    isAcr: true,
                });
                if (existingAcrRegistrar) {
                    return errorHandler_1.default.sendError(res, 400, 'A registrar with an ACR seal already exists for this court.');
                }
            }
            const uploadedFiles = req.files;
            let signatureImageUrl;
            let sealImageUrl;
            try {
                if (uploadedFiles.registrarSeal && uploadedFiles.registrarSeal.length > 0) {
                    const sealFile = uploadedFiles.registrarSeal[0];
                    const base64Seal = sealFile.buffer.toString('base64');
                    const sealResult = yield cloudinaryConfig_1.default.uploader.upload(`data:image/jpeg;base64,${base64Seal}`);
                    sealImageUrl = sealResult.secure_url;
                    console.log('Uploaded seal image URL:', sealImageUrl);
                }
                if (uploadedFiles.registrarSignature && uploadedFiles.registrarSignature.length > 0) {
                    const signatureFile = uploadedFiles.registrarSignature[0];
                    const base64Signature = signatureFile.buffer.toString('base64');
                    const signatureResult = yield cloudinaryConfig_1.default.uploader.upload(`data:image/jpeg;base64,${base64Signature}`);
                    signatureImageUrl = signatureResult.secure_url;
                    console.log('Uploaded signature image URL:', signatureImageUrl);
                }
            }
            catch (uploadError) {
                console.error('Error uploading files:', uploadError);
                return errorHandler_1.default.sendError(res, 500, 'Error uploading files');
            }
            const salt = (0, helpers_1.random)();
            const hashedPassword = (0, helpers_1.authentication)(salt, password);
            let newUser = {};
            if (role === "registrar") {
                newUser = {
                    firstName,
                    lastName,
                    userType: "Individual",
                    isVerified: true,
                    role,
                    email,
                    status,
                    registrarSeal: sealImageUrl,
                    registrarSignature: signatureImageUrl,
                    permission,
                    courtName,
                    judicialDivision,
                    courtRoomNo,
                    isAcr: isAcr === 'true',
                    authentication: {
                        salt,
                        password: hashedPassword,
                    },
                };
            }
            else {
                newUser = {
                    firstName,
                    lastName,
                    userType: "Individual",
                    isVerified: true,
                    role,
                    email,
                    status,
                    permission,
                    authentication: {
                        salt,
                        password: hashedPassword,
                    },
                };
            }
            console.log('New user data:', newUser);
            try {
                const user = yield (0, users_1.createUser)(newUser);
                const activityLog = new activityLog_1.default({
                    userId: userId,
                    action: 'Added',
                    entityType: 'User',
                    entityId: user._id
                });
                yield activityLog.save();
                if (role === "registrar") {
                    yield (0, exports.createCourtRecord)(user._id); // Assuming createCourtRecord is defined somewhere
                }
                return res.status(200).json({ success: true, message: 'New user added successfully', user }).end();
            }
            catch (createError) {
                console.error('Error creating user:', createError);
                return errorHandler_1.default.sendError(res, 500, 'Error creating user ' + createError);
            }
        }));
    }
    catch (error) {
        console.error('Unexpected error:', error);
        return res.sendStatus(500);
    }
});
exports.addNewUser = addNewUser;
const allowedMimeTypes = ['image/jpeg', 'image/png']; // Allowed photo mimetypes
const upload = (0, multer_1.default)({
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only photo uploads are allowed (jpg/png)'));
        }
    },
});
const addNewUser2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            firstName: joi_1.default.string().required(),
            lastName: joi_1.default.string().required(),
            role: joi_1.default.string().required(),
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required(),
            permission: joi_1.default.array().items(joi_1.default.string().valid(...Object.values(users_4.UserPermission))).required(),
            status: joi_1.default.string().required(),
            courtName: joi_1.default.string(),
            judicialDivision: joi_1.default.string(),
            courtRoomNo: joi_1.default.string()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { firstName, lastName, role, email, password, permission, status, courtName, judicialDivision, courtRoomNo } = req.body;
        const existingUser = yield (0, users_1.getUserByEmail)(email);
        if (existingUser) {
            return errorHandler_1.default.sendError(res, 400, 'User with this email already exists');
        }
        const salt = (0, helpers_1.random)();
        const hashedPassword = (0, helpers_1.authentication)(salt, password);
        let newUser = {};
        // if role == registrar add 3 input
        if (role === "registrar") {
            newUser = {
                firstName,
                lastName,
                userType: "Individual",
                isVerified: true,
                role,
                email,
                status,
                permission,
                courtName,
                judicialDivision,
                courtRoomNo,
                authentication: {
                    salt,
                    password: hashedPassword,
                },
            };
        }
        else {
            newUser = {
                firstName,
                lastName,
                userType: "Individual",
                isVerified: true,
                role,
                email,
                status,
                permission,
                authentication: {
                    salt,
                    password: hashedPassword,
                },
            };
        }
        console.log(newUser);
        const user = yield (0, users_1.createUser)(newUser);
        // Log the activity
        const activityLog = new activityLog_1.default({
            userId: req.user.userId,
            action: 'Added',
            entityType: 'User',
            entityId: user._id
        });
        yield activityLog.save();
        if (role === "registrar") {
            const courtRecord = yield (0, exports.createCourtRecord)(user._id);
        }
        return res.status(200).json({ success: true, message: 'New user added successfully', user }).end();
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.addNewUser2 = addNewUser2;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user ID');
        }
        const user = yield users_2.default.findById(id);
        if (!user) {
            return errorHandler_1.default.sendError(res, 404, 'User not found');
        }
        const deletedUser = yield (0, users_3.deleteUserById)(id);
        if (!deletedUser) {
            return errorHandler_1.default.sendError(res, 500, 'Failed to delete user');
        }
        // Log the activity
        const activityLog = new activityLog_1.default({
            userId: req.user.userId, //Get logged userid
            action: 'Deleted',
            entityType: 'User',
            entityId: user._id
        });
        yield activityLog.save();
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'User deleted successfully', deletedUser);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.deleteUser = deleteUser;
// Update user
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user ID');
        }
        const user = yield users_2.default.findById(id);
        if (!user) {
            return errorHandler_1.default.sendError(res, 404, 'User not found');
        }
        upload.fields([{ name: 'registrarSeal' }, { name: 'registrarSignature' }])(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return errorHandler_1.default.sendError(res, 400, err.message);
            }
            const { firstName, lastName, role, status, isAcr, courtName, judicialDivision } = req.body;
            let { permission, email } = req.body;
            // Ensure permission is an array
            if (!Array.isArray(permission)) {
                if (typeof permission === 'string') {
                    permission = permission.split(',').map(p => p.trim());
                }
                else {
                    permission = [];
                }
            }
            if (!firstName || !lastName || !role || !status) {
                return errorHandler_1.default.sendError(res, 400, 'First name, last name, role, and status are required');
            }
            // Check if the email has changed
            if (email && email !== user.email) {
                const existingUserWithEmail = yield users_2.default.findOne({ email });
                if (existingUserWithEmail && existingUserWithEmail._id.toString() !== id) {
                    return errorHandler_1.default.sendError(res, 400, 'Email address is already registered');
                }
            }
            if (isAcr === 'true') {
                const existingAcrRegistrar = yield users_2.default.findOne({
                    isAcr: true,
                    judicialDivision: judicialDivision || user.judicialDivision
                });
                if (existingAcrRegistrar && existingAcrRegistrar._id.toString() !== id) {
                    existingAcrRegistrar.isAcr = false;
                    yield existingAcrRegistrar.save();
                }
            }
            const uploadedFiles = req.files;
            let signatureImageUrl = user.registrarSignature;
            let sealImageUrl = user.registrarSeal;
            try {
                if (uploadedFiles.registrarSeal && uploadedFiles.registrarSeal.length > 0) {
                    const sealFile = uploadedFiles.registrarSeal[0];
                    const base64Seal = sealFile.buffer.toString('base64');
                    const sealResult = yield cloudinaryConfig_1.default.uploader.upload(`data:image/jpeg;base64,${base64Seal}`);
                    sealImageUrl = sealResult.secure_url;
                }
                if (uploadedFiles.registrarSignature && uploadedFiles.registrarSignature.length > 0) {
                    const signatureFile = uploadedFiles.registrarSignature[0];
                    const base64Signature = signatureFile.buffer.toString('base64');
                    const signatureResult = yield cloudinaryConfig_1.default.uploader.upload(`data:image/jpeg;base64,${base64Signature}`);
                    signatureImageUrl = signatureResult.secure_url;
                }
            }
            catch (uploadError) {
                console.error('Error uploading files:', uploadError);
                return errorHandler_1.default.sendError(res, 500, 'Error uploading files');
            }
            // Update user data
            user.firstName = firstName;
            user.lastName = lastName;
            user.role = role;
            user.permission = permission;
            user.status = status;
            user.isAcr = isAcr === 'true';
            user.registrarSeal = sealImageUrl;
            user.registrarSignature = signatureImageUrl;
            if (email) {
                user.email = email;
            }
            if (courtName) {
                user.courtName = courtName;
            }
            if (judicialDivision) {
                user.judicialDivision = judicialDivision;
            }
            yield user.save();
            // Log the activity
            const activityLog = new activityLog_1.default({
                userId: req.user.userId, // Get logged user ID
                action: 'Updated',
                entityType: 'User',
                entityId: user._id
            });
            yield activityLog.save();
            return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Data updated successfully previous ACR was changed', user);
        }));
    }
    catch (error) {
        console.error('Unexpected error:', error);
        return res.sendStatus(500);
    }
});
exports.updateUser = updateUser;
//Get all  users
const ITEMS_PER_PAGE = 10;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const ITEMS_PER_PAGE = 10; // Define your ITEMS_PER_PAGE value
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const users = yield users_2.default.find()
            .sort({ _id: -1 }) // Sort by _id in descending order
            .skip(skip)
            .limit(ITEMS_PER_PAGE)
            .lean();
        const totalUsersCount = yield users_2.default.countDocuments();
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Users fetched successfully', {
            users,
            totalUsers: totalUsersCount,
            currentPage: page,
            totalPages: Math.ceil(totalUsersCount / ITEMS_PER_PAGE),
        });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getAllUsers = getAllUsers;
//Get user by id single user
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user ID');
        }
        const user = yield users_2.default.findById(id);
        if (!user) {
            return errorHandler_1.default.sendError(res, 404, 'User not found');
        }
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'User fetched successfully', user);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getUser = getUser;
//Registrat Setting
const getRegistrarSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user ID');
        }
        const user = yield users_2.default.findById(id);
        if (!user) {
            return errorHandler_1.default.sendError(res, 404, 'User not found');
        }
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Registrar settings fetched successfully', user);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getRegistrarSetting = getRegistrarSetting;
//function to create a court record
const createCourtRecord = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courtRecord = yield settings_1.default.create({
            userId,
            courtInfo: '',
            courtNumber: '',
            judicialDivision: ''
        });
        return courtRecord;
    }
    catch (error) {
        console.error("Error creating court record:", error);
        throw error;
    }
});
exports.createCourtRecord = createCourtRecord;
//Get all  registered users
const registrarUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //check if reference number correct
        const registrar = yield users_2.default.find({ role: "registrar" });
        if (!registrar) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid role');
        }
        const formattedRegistrars = registrar.map(registrar => ({
            id: registrar._id,
            name: registrar.firstName + ' ' + registrar.lastName,
            courtName: registrar.courtName,
            courtRoomNo: registrar.courtRoomNo,
        }));
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Registered users fetch successfully', formattedRegistrars);
    }
    catch (error) {
        console.error('Error retrieving registered uses:', error);
        res.status(500).json({ error: 'Failed to generate users' });
    }
});
exports.registrarUsers = registrarUsers;
