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
exports.updateSettingsUserx = exports.updateSettingsUser = exports.generateOtp = exports.getSettingsUser = exports.updateSettingsRegistrar = exports.getSettingsRegistrar = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const SuccessHandler_1 = __importDefault(require("../utils/SuccessHandler"));
const mongoose_1 = __importDefault(require("mongoose"));
const users_1 = __importDefault(require("../db/users"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const helpers_1 = require("../helpers");
const nodemailer_1 = __importDefault(require("nodemailer"));
const otp_1 = __importDefault(require("../db/otp"));
const otp_2 = require("../helpers/otp");
const cloudinaryConfig_1 = __importDefault(require("../config/cloudinaryConfig"));
const multer_1 = __importDefault(require("multer"));
require('dotenv').config();
const getSettingsRegistrar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user ID');
        }
        console.log(userId);
        // Find settings by userId and project only required fields
        const setting = yield users_1.default.findOne({ _id: userId }, { courtName: 1, judicialDivision: 1, courtRoomNo: 1, email: 1 });
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Settings fetched successfully', setting);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getSettingsRegistrar = getSettingsRegistrar;
// Update registrar settings
const updateSettingsRegistrar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user ID');
        }
        const { courtRoomNo, courtName, judicialDivision, password } = req.body;
        let setting = yield users_1.default.findOne({ _id: userId }, { courtName: 1, judicialDivision: 1, courtRoomNo: 1 });
        if (!setting) {
            setting = new users_1.default({
                userId,
                courtName,
                judicialDivision,
                courtRoomNo
            });
        }
        else {
            setting.courtName = courtName || setting.courtName;
            setting.courtRoomNo = courtRoomNo || setting.courtRoomNo;
            setting.judicialDivision = judicialDivision || setting.judicialDivision;
        }
        setting = yield setting.save();
        // Update password if provided and not empty
        if (password !== undefined && password !== '') {
            let user = yield users_1.default.findById(userId);
            if (!user) {
                return errorHandler_1.default.sendError(res, 404, 'User not found');
            }
            // Generate a salt and hash the password with bcrypt
            const salt = (0, helpers_1.random)();
            const hashedPassword = (0, helpers_1.authentication)(salt, password);
            user.authentication = {
                salt,
                password: hashedPassword,
            };
            console.log(user);
            user = yield user.save();
        }
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Settings updated successfully', setting);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.updateSettingsRegistrar = updateSettingsRegistrar;
//User get setting profile
const getSettingsUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user ID');
        }
        console.log(userId);
        // Find settings by userId
        const setting = yield users_1.default.findOne({ _id: userId });
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Settings fetched successfully', setting);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getSettingsUser = getSettingsUser;
//Generate otp
const generateOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { email } = req.body;
        const otpCode = generateOTP(); // Generate OTP
        // Log the generated OTP
        console.log('Generated OTP:', otpCode);
        yield sendVerificationEmail(email, otpCode, userId); // Send OTP via email
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    }
    catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to generate OTP' });
    }
});
exports.generateOtp = generateOtp;
// Helper function to generate OTP
function generateOTP() {
    // Generate a random 6-digit OTP 
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// Helper function to send OTP via email
function sendVerificationEmail(email, otpCode, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail', // Use Gmail as the email service
                auth: {
                    user: process.env.GMAIL_USER, // Your Gmail email address
                    pass: process.env.GMAIL_PASSWORD, // Your Gmail password or app password
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });
            // Define email options
            const mailOptions = {
                from: process.env.GMAIL_USER, // Sender address (your Gmail email address)
                to: email, // Recipient address (provided email address)
                subject: 'OTP Verification', // Email subject
                text: `Your OTP code is: ${otpCode}`, // Email body containing the OTP code
            };
            // Send the email
            const info = yield transporter.sendMail(mailOptions);
            const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
            const otpDocument = new otp_1.default({ otpCode, expiry, userId: userId, otp: otpCode });
            yield otpDocument.save();
            // Log a message indicating that the email has been sent successfully
            console.log('Email sent:', info.response);
        }
        catch (error) {
            // Log any errors that occur during the email sending process
            console.error('Error sending email:', error);
            throw new Error('Failed to send verification email');
        }
    });
}
const allowedMimeTypes = ['image/jpeg', 'image/png']; // Allowed photo mimetypes
const upload = (0, multer_1.default)({
    // ... other Multer configuration options
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            // Allow upload if mimetype is in the allowed list
            cb(null, true);
        }
        else {
            // Reject upload if mimetype is not allowed
            cb(new Error('Only photo uploads are allowed jpg/png'));
        }
    },
});
//const upload = multer({}); 
const updateSettingsUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        upload.single('avatar')(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(err);
            if (err) {
                return errorHandler_1.default.sendError(res, 400, err.message);
            }
            // Access text fields from req.body
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const email = req.body.email;
            const password = req.body.password;
            const otp = req.body.otp;
            let user = yield users_1.default.findById(userId);
            if (!user) {
                return errorHandler_1.default.sendError(res, 404, 'User not found');
            }
            // Check if the requested email is different from the current one
            if (email !== user.email) {
                // Check if email already exists
                const existingUser = yield users_1.default.findOne({ email: email });
                if (existingUser && existingUser._id.toString() !== userId) {
                    return errorHandler_1.default.sendError(res, 400, 'Email already exists');
                }
                else if ((otp !== undefined && otp !== '')) {
                    const isOtpValid = yield (0, otp_2.verifyOTP)(userId, otp);
                    if (!isOtpValid) {
                        return errorHandler_1.default.sendError(res, 400, 'Invalid OTP');
                    }
                }
                else {
                    return errorHandler_1.default.sendError(res, 400, 'You need otp to change email address');
                }
                // Update email
                user.email = email;
            }
            // Update password if provided and not empty
            if (password !== undefined && password !== '') {
                let user = yield users_1.default.findById(userId);
                if (!user) {
                    return errorHandler_1.default.sendError(res, 404, 'User not found');
                }
                const salt = (0, helpers_1.random)();
                const hashedPassword = (0, helpers_1.authentication)(salt, password);
                user.authentication = {
                    salt,
                    password: hashedPassword,
                };
                user = yield user.save();
            }
            // Access uploaded file (if present):
            const uploadedFile = req.file;
            if (uploadedFile) {
                console.log(uploadedFile);
                // Convert buffer to base64 string
                const base64String = uploadedFile.buffer.toString('base64');
                // Upload image to Cloudinary
                const result = yield cloudinaryConfig_1.default.uploader.upload(`data:image/jpeg;base64,${base64String}`);
                // Get image URL from Cloudinary response
                const imageUrl = result.secure_url;
                console.log('Uploaded avatar image URL:', imageUrl);
                // Update user's photoUrl
                user.photoUrl = imageUrl;
                console.log('Uploaded File:', uploadedFile.filename);
                user.firstName = firstName;
                user.lastName = lastName;
                // Save the updated user
                user = yield user.save();
                return SuccessHandler_1.default.sendCustomSuccess(res, 200, "Updated successfully", user);
            }
            else {
                console.log("NO file selected");
                user.firstName = firstName;
                user.lastName = lastName;
                user = yield user.save();
                return SuccessHandler_1.default.sendCustomSuccess(res, 200, "Updated successfully", user);
            }
        }));
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.updateSettingsUser = updateSettingsUser;
const updateSettingsUserx = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user ID');
        }
        const schema = joi_1.default.object({
            firstName: joi_1.default.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { firstName, lastName, email, password, otp } = req.body;
        console.log("First Name: " + req.body.firstName);
        // Find user by userId
        let user = yield users_1.default.findById(userId);
        if (!user) {
            return errorHandler_1.default.sendError(res, 404, 'User not found');
        }
        // Verify OTP if provided
        if (otp !== undefined && otp !== '') {
            const isOtpValid = yield (0, otp_2.verifyOTP)(userId, otp);
            if (!isOtpValid) {
                return errorHandler_1.default.sendError(res, 400, 'Invalid OTP');
            }
        }
        // Update email if provided and valid OTP
        if (email !== undefined && email !== '') {
            // Check if the requested email is different from the current one
            if (email !== user.email) {
                // Check if email already exists
                const existingUser = yield users_1.default.findOne({ email: email });
                if (existingUser && existingUser._id.toString() !== userId) {
                    return errorHandler_1.default.sendError(res, 400, 'Email already exists');
                }
            }
            // Update email
            user.email = email;
        }
        user.firstName = firstName;
        user.lastName = lastName;
        // Update password if provided
        if (password !== undefined && password !== '') {
            // Generate a salt and hash the password with bcrypt
            const saltRounds = 10; // Number of salt rounds
            const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
            // Update password in the user document
            user.password = hashedPassword;
        }
        // Handle file upload
        upload.single('avatar')(req, res, function (err) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (err) {
                        console.error(err);
                        return res.sendStatus(500);
                    }
                    // Check if a file was uploaded
                    if (req.file) {
                        // Convert buffer to base64 string
                        const base64String = req.file.buffer.toString('base64');
                        // Upload image to Cloudinary
                        const result = yield cloudinaryConfig_1.default.uploader.upload(`data:image/jpeg;base64,${base64String}`);
                        // Get image URL from Cloudinary response
                        const imageUrl = result.secure_url;
                        console.log('Uploaded avatar image URL:', imageUrl);
                        // Update user's photoUrl
                        user.photoUrl = imageUrl;
                    }
                    // Save the updated user
                    user = yield user.save();
                    return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Settings updated successfully', user);
                }
                catch (error) {
                    console.error('Error handling file upload:', error);
                    return res.sendStatus(500);
                }
            });
        });
    }
    catch (error) {
        console.error('Error updating settings:', error);
        return res.sendStatus(500);
    }
});
exports.updateSettingsUserx = updateSettingsUserx;
