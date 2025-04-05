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
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
require('dotenv').config();
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
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Number },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    permission: [{ type: String, enum: Object.values(UserPermission) }],
    isVerified: { type: Boolean, default: false },
    isAcr: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    verificationToken: { type: String },
    photoUrl: { type: String, required: false },
    registrarSeal: { type: String, required: false },
    registrarSignature: { type: String, required: false }
}, { timestamps: true });
const UserModel = mongoose_1.default.model('User', userSchema);
const sendEmailWithTribeArc = (message, email, title, platform, fromEmail, replyToEmail, verificationToken) => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = process.env.TRIBEC_MAIL_KEY;
    const data = {
        api_key: apiKey,
        from_name: "Lispendes",
        from_email: "trm@tribearc.us",
        reply_to: "trm@tribearc.us",
        subject: "Email Verification",
        html_text: `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
    
      <!-- Web Font / @font-face : BEGIN -->
      <!--[if mso]>
        <style type="text/css">
          body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
        </style>
      <![endif]-->
      <!--[if !mso]><!-->
      <!-- Insert web font reference, for example Google Fonts -->
      <!--<![endif]-->
    
      <!-- CSS Reset : BEGIN -->
      <style>
    
        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
          margin: 0 auto !important;
          padding: 0 !important;
          height: 100% !important;
          width: 100% !important;
        }
    
        /* What it does: Stops email clients resizing small text. */
        * {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
    
        /* What it does: Forces Outlook.com to display emails full width. */
        .ExternalClass {
          width: 100%;
        }
    
        /* What is does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
          margin: 0 !important;
        }
    
        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
          mso-table-lspace: 0pt !important;
          mso-table-rspace: 0pt !important;
        }
    
        /* What it does: Fixes webkit padding issue. */
        table {
          border-spacing: 0 !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
          margin: 0 auto !important;
        }
    
        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
          -ms-interpolation-mode: bicubic;
        }
    
        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
          text-decoration: none;
        }
    
        /* What it does: A work-around for email clients meddling in triggered links. */
        a[x-apple-data-detectors],  /* iOS */
        .unstyle-auto-detected-links a,
        .aBn {
          border-bottom: 0 !important;
          cursor: default !important;
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
    
        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
          display: none !important;
          opacity: 0.01 !important;
        }
    
        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
          color: inherit !important;
        }
    
        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img + div {
          display: none !important;
        }
    
        /* What it does: Adds a default line-height to all tables. */
        table {
          border-collapse: collapse !important;
        }
    
        /* What it does: Prevents clients from adding padding to the body. */
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
    
        /* What it does: Makes the email width 100% on all devices and remove the margin */
        .email-container {
          max-width: 600px !important;
          margin: auto !important;
        }
    
        /* What it does: Makes the text size adjustable */
        .email-container p, 
        .email-container span, 
        .email-container a, 
        .email-container li, 
        .email-container td, 
        .email-container body {
          font-size: 15px !important;
          line-height: 1.5 !important;
        }
    
        /* What it does: Fixes Outlook.com line-height bug. */
        .email-container table {
          width: 100% !important;
        }
    
      </style>
      <!-- CSS Reset : END -->
    
      <!-- Progressive Enhancements : BEGIN -->
      <style>
    
        /* What it does: Hover styles for buttons */
        .button-td, 
        .button-a {
          transition: all 100ms ease-in;
        }
        .button-td:hover, 
        .button-a:hover {
          background: #555555 !important;
          border-color: #555555 !important;
        }
    
      </style>
      <!-- Progressive Enhancements : END -->
    
    </head>
    <body width="100%" bgcolor="#f1f1f1" style="margin: 0; mso-line-height-rule: exactly;">
      <center style="width: 100%; background: #f1f1f1; text-align: left;">
    
        <!-- Visually Hidden Preheader Text : BEGIN -->
        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
          Please verify your email address
        </div>
        <!-- Visually Hidden Preheader Text : END -->
    
        <br>
        <br>
        <br>
        <!-- Create background white div : BEGIN -->
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">
          <!--[if mso]>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">
          <tr>
          <td>
          <![endif]-->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px 20px; text-align: center; font-family: sans-serif; font-size: 24px; mso-height-rule: exactly; line-height: 1.3;">
                <h1 style="margin: 0; font-size: 24px;">Verify Your Email Address</h1>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0;">Please click the button below to verify your email address.</p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center;">
                <!-- Button : BEGIN -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;">
                  <tr>
                    <td class="button-td" bgcolor="#222222" style="border-radius: 4px; text-align: center;">
                      <a href="https://lispendes-enugu.fly.dev/auth/verify/${verificationToken}" class="button-a" style="background: #222222; border: 1px solid #222222; font-family: sans-serif; font-size: 15px; line-height: 1.5; text-decoration: none; padding: 10px 25px; color: #ffffff; display: block; border-radius: 4px;">
                        Verify Email
                      </a>
                    </td>
                  </tr>
                </table>
                <!-- Button : END -->
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0;">If you did not request this email, you can safely ignore it.</p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0;">Thank you,<br>Lispendes</p>
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </div>
        <br>
        <br>
        <br>
        <!-- Create background white div : END -->
    
      </center>
    </body>
    </html>
    `,
        track_opens: '1',
        track_clicks: '1',
        send_campaign: '1',
        json: '1',
        emails: email,
        business_address: "",
        business_name: 'Eventeps',
        editor_type: 'editor'
    };
    try {
        const response = yield axios_1.default.post('https://mail.tribearc.com/api/campaigns/send_now.php', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Api-Token': apiKey
            }
        });
        console.log('Email sent successfully:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});
const createGuestUser = (values) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = values;
    const newUser = Object.assign(Object.assign({}, values), { isVerified: true });
    try {
        const user = yield new UserModel(newUser).save();
        return user;
    }
    catch (error) {
        throw new Error(`Failed to create user: ${error}`);
    }
});
exports.createGuestUser = createGuestUser;
const createUser = (values) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, message, title, platform, fromEmail, replyToEmail } = values;
    const verificationToken = generateVerificationToken();
    const newUser = Object.assign(Object.assign({}, values), { isVerified: false, verificationToken });
    try {
        yield sendEmailWithTribeArc(message, email, title, platform, fromEmail, replyToEmail, verificationToken);
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
