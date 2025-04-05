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
exports.sendCertificateEmail = exports.sendRegistrationEmail = void 0;
const otp_1 = __importDefault(require("../db/otp"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const axios = require('axios');
//Send OTP via email
function sendVerificationEmail(email, otpCode, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail', // Use Gmail as the email service
                auth: {
                    user: 'alkasima5050@gmail.com', // Your Gmail email address
                    pass: 'dtwfhgprxxbwhwjm', // Your Gmail password or app password
                },
                tls: {
                    rejectUnauthorized: false, // Accept self-signed certificates (not recommended for production)
                },
            });
            // Define email options
            const mailOptions = {
                from: 'alkasima5050@gmail.com', // Sender address (your Gmail email address)
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
//Send regisgration details via email
const sendRegistrationEmail = (email, password, username) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: 'alkasima5050@gmail.com', // sender address
        to: email,
        subject: 'New account creation details',
        html: `Hello ${username} Your new account details is: <p>Email: ${email}</p> <p>Password: ${password}</p>`,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log('email sent successfully');
    }
    catch (error) {
        console.error('Error sending  email:', error);
        throw new Error('Failed to send  email');
    }
});
exports.sendRegistrationEmail = sendRegistrationEmail;
//export default sendRegistrationEmail;
// Function to send email with PDF attachment
const sendCertificateEmail = (email, pdfFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a transporter for sending email
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail', // Use Gmail as the email service
        auth: {
            user: 'alkasima5050@gmail.com', // Your Gmail email address
            pass: 'dtwfhgprxxbwhwjm', // Your Gmail password or app password
        },
        tls: {
            rejectUnauthorized: false, // Accept self-signed certificates (not recommended for production)
        },
    });
    // Define email options
    const mailOptions = {
        from: 'alkasima5050@gmail.com', // Sender address (your Gmail email address)
        to: email, // Recipient address (provided email address)
        subject: 'Certificate Attachment', // Email subject
        text: 'Please find the certificate attached.', // Email body
        attachments: [
            {
                filename: 'certificate.pdf', // Name of the attachment
                path: pdfFilePath, // Path to the PDF file
            },
        ],
    };
    try {
        // Send the email with the PDF attachment
        yield transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});
exports.sendCertificateEmail = sendCertificateEmail;
