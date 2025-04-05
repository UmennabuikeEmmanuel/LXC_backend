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
exports.generateCertificate = exports.sendCertificate = exports.downloadCertificate = exports.searchAndDownload = exports.processSearchPayment = exports.processPayment = void 0;
const joi_1 = __importDefault(require("joi"));
const bodyParser = require('body-parser');
const paystack = require('paystack')('sk_test_b7aa1ecd5193a853231db4fe7feaff5cb23244ff');
const SuccessHandler_1 = __importDefault(require("../utils/SuccessHandler"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const axios_1 = __importDefault(require("axios"));
const payment_1 = __importDefault(require("../db/payment"));
const helpers_1 = require("../helpers");
const users_1 = require("../db/users");
const mail_1 = require("../mail/mail");
const pdfkit_1 = __importDefault(require("pdfkit"));
const users_2 = __importDefault(require("../db/users"));
const cases_1 = __importDefault(require("../db/cases"));
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const activityLog_1 = __importDefault(require("../db/activityLog"));
const moment_1 = __importDefault(require("moment"));
const searchPayment_1 = __importDefault(require("../db/searchPayment"));
require('dotenv').config();
const processPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().required(),
            cardNumber: joi_1.default.string().required(),
            cvv: joi_1.default.string().required(),
            expiryMonth: joi_1.default.string().required(),
            expiryYear: joi_1.default.string().required(),
            username: joi_1.default.string().required(),
            caseId: joi_1.default.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { email, cardNumber, cvv, expiryMonth, expiryYear, username, caseId } = req.body;
        //check if email is not exist register user and send email his login details
        const existingUser = yield (0, users_1.getUserByEmail)(email);
        const password = generateRandomPassword();
        let userId = "";
        if (!existingUser) {
            const salt = (0, helpers_1.random)();
            const hashedPassword = (0, helpers_1.authentication)(salt, password);
            const newUser = {
                firstName: username,
                lastName: "",
                userType: "Individual",
                isVerified: true,
                email,
                authentication: {
                    salt,
                    password: hashedPassword,
                },
            };
            //send reg details
            (0, mail_1.sendRegistrationEmail)(email, password, username);
            const user = yield (0, users_1.createGuestUser)(newUser);
            userId = user._id;
        }
        else {
            userId = existingUser._id;
        }
        // Find the payment record by caseId
        const payment = yield payment_1.default.findOne({ _id: caseId });
        let access_type = 'view'; // Default value
        if (payment) {
            access_type = payment.accessType;
        }
        // Toggle the access_type value
        if (access_type === 'view') {
            access_type = 'download';
        }
        else {
            access_type = 'view';
        }
        const secretKey = process.env.PAYSTACK_SECRETE_KEY;
        const data = {
            email: email,
            amount: 48600,
            card: {
                number: cardNumber,
                cvv: cvv,
                expiry_month: expiryMonth,
                expiry_year: expiryYear
            }
        };
        yield axios_1.default.post('https://api.paystack.co/charge', data, {
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        })
            .then((response) => __awaiter(void 0, void 0, void 0, function* () {
            // Handle success
            console.log('Response:', response.data);
            if (response.data.data.status === 'success') {
                const paymentDetails = {
                    amount: response.data.data.amount / 100, // Convert amount from kobo to naira
                    currency: response.data.data.currency,
                    transactionDate: response.data.data.transaction_date,
                    authorizationCode: response.data.data.authorization.authorization_code,
                    reference: response.data.data.reference,
                    userId: userId,
                    caseId: caseId,
                    accessType: access_type,
                };
                //Save payment details=
                const payment = new payment_1.default({
                    userId: userId,
                    amount: paymentDetails.amount,
                    reference: paymentDetails.reference,
                    status: response.data.data.status,
                    paid_at: paymentDetails.transactionDate,
                    ip_address: req.ip,
                    accessType: access_type,
                    authorization_code: paymentDetails.authorizationCode,
                    caseId: caseId,
                    paymentDetails
                });
                yield payment.save();
                // Log the activity
                const activityLog = new activityLog_1.default({
                    userId: userId,
                    action: 'Search',
                    entityType: 'Case',
                    entityId: caseId,
                    caseId: caseId,
                    reference: paymentDetails.reference
                });
                yield activityLog.save();
                return SuccessHandler_1.default.sendCustomSuccess(res, 200, "Payment Successful", paymentDetails);
            }
            else {
                return errorHandler_1.default.sendError(res, 400, 'Payment failed: ' + response.data.data.gateway_response);
            }
        }))
            .catch(error => {
            // Handle error
            console.error('Error:', error.response ? error.response.data : error.message);
            if (error.response && error.response.data) {
                const responseData = error.response.data;
                return errorHandler_1.default.sendError(res, 400, 'Payment failed: ' + responseData.data.message);
            }
            else {
                return errorHandler_1.default.sendError(res, 500, 'An error occurred while processing your request.');
            }
        });
    }
    catch (error) {
        console.error(error);
        errorHandler_1.default.sendError(res, 400, 'Error: ' + error.message);
        return res.sendStatus(400);
    }
});
exports.processPayment = processPayment;
//Search payment script
const processSearchPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().required(),
            cardNumber: joi_1.default.string().required(),
            cvv: joi_1.default.string().required(),
            expiryMonth: joi_1.default.string().required(),
            expiryYear: joi_1.default.string().required(),
            username: joi_1.default.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { email, cardNumber, cvv, expiryMonth, expiryYear, username, caseId } = req.body;
        //check if email is not exist register user and send email his login details
        const existingUser = yield (0, users_1.getUserByEmail)(email);
        const password = generateRandomPassword();
        let userId = "";
        if (!existingUser) {
            const salt = (0, helpers_1.random)();
            const hashedPassword = (0, helpers_1.authentication)(salt, password);
            const newUser = {
                firstName: username,
                lastName: "",
                userType: "Individual",
                isVerified: true,
                email,
                authentication: {
                    salt,
                    password: hashedPassword,
                },
            };
            //send reg details
            (0, mail_1.sendRegistrationEmail)(email, password, username);
            const user = yield (0, users_1.createGuestUser)(newUser);
            userId = user._id;
        }
        else {
            userId = existingUser._id;
        }
        // Find the payment record by caseId
        const payment = yield payment_1.default.findOne({ _id: caseId });
        let access_type = 'view'; // Default value
        // if (payment) {
        //     access_type = payment.accessType as 'view' | 'download';
        // }
        // // Toggle the access_type value
        // if (access_type === 'view') {
        //     access_type = 'download';
        // } else {
        //     access_type = 'view';
        // }
        const secretKey = process.env.PAYSTACK_SECRETE_KEY;
        const data = {
            email: email, // Customer's email address
            amount: 48600, // Amount in kobo (example: 50000 for ₦500.00)
            card: {
                number: cardNumber,
                cvv: cvv,
                expiry_month: expiryMonth,
                expiry_year: expiryYear
            }
        };
        yield axios_1.default.post('https://api.paystack.co/charge', data, {
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        })
            .then((response) => __awaiter(void 0, void 0, void 0, function* () {
            // Handle success
            if (response.data.data.status === 'success') {
                const paymentDetails = {
                    amount: response.data.data.amount / 100, // Convert amount from kobo to naira
                    currency: response.data.data.currency,
                    transactionDate: response.data.data.transaction_date,
                    authorizationCode: response.data.data.authorization.authorization_code,
                    reference: response.data.data.reference,
                    userId: userId,
                    accessType: access_type,
                };
                //Save payment details=
                const payment = new searchPayment_1.default({
                    userId: userId,
                    amount: paymentDetails.amount,
                    reference: paymentDetails.reference,
                    status: response.data.data.status,
                    paid_at: paymentDetails.transactionDate,
                    ip_address: req.ip,
                    accessType: access_type,
                    authorization_code: paymentDetails.authorizationCode,
                    paymentDetails
                });
                yield payment.save();
                return SuccessHandler_1.default.sendCustomSuccess(res, 200, "Payment Successful", paymentDetails);
            }
            else {
                return errorHandler_1.default.sendError(res, 400, 'Payment failed: ' + response.data.data.gateway_response);
            }
        }))
            .catch(error => {
            // Handle error
            console.error('Error:', error.response ? error.response.data : error.message);
            if (error.response && error.response.data) {
                const responseData = error.response.data;
                return errorHandler_1.default.sendError(res, 400, 'Payment failed: ' + responseData.data.message);
            }
            else {
                return errorHandler_1.default.sendError(res, 500, 'An error occurred while processing your request.');
            }
        });
    }
    catch (error) {
        console.error(error);
        errorHandler_1.default.sendError(res, 400, 'Error: ' + error.message);
        return res.sendStatus(400);
    }
});
exports.processSearchPayment = processSearchPayment;
//Search and downoad
const searchAndDownload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().required(),
            cardNumber: joi_1.default.string().required(),
            cvv: joi_1.default.string().required(),
            expiryMonth: joi_1.default.string().required(),
            expiryYear: joi_1.default.string().required(),
            username: joi_1.default.string().required(),
            caseId: joi_1.default.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { email, cardNumber, cvv, expiryMonth, expiryYear, username, caseId } = req.body;
        //check if email is not exist register user and send email his login details
        const existingUser = yield (0, users_1.getUserByEmail)(email);
        const password = generateRandomPassword();
        let userId = "";
        if (!existingUser) {
            const salt = (0, helpers_1.random)();
            const hashedPassword = (0, helpers_1.authentication)(salt, password);
            const newUser = {
                firstName: username,
                lastName: "",
                userType: "Individual",
                isVerified: true,
                email,
                authentication: {
                    salt,
                    password: hashedPassword,
                },
            };
            //send reg details
            (0, mail_1.sendRegistrationEmail)(email, password, username);
            const user = yield (0, users_1.createGuestUser)(newUser);
            userId = user._id;
        }
        else {
            userId = existingUser._id;
        }
        // Find the payment record by caseId
        const payment = yield payment_1.default.findOne({
            $or: [
                { _id: caseId },
                { userId: userId }
            ]
        });
        let access_type = 'search_and_download'; // Default value
        const secretKey = process.env.PAYSTACK_SECRETE_KEY;
        const data = {
            email: email, // Customer's email address
            amount: 48600, // Amount in kobo (example: 50000 for ₦500.00)
            card: {
                number: cardNumber,
                cvv: cvv,
                expiry_month: expiryMonth,
                expiry_year: expiryYear
            }
        };
        yield axios_1.default.post('https://api.paystack.co/charge', data, {
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        })
            .then((response) => __awaiter(void 0, void 0, void 0, function* () {
            // Handle success
            console.log('Response:', response.data);
            if (response.data.data.status === 'success') {
                const paymentDetails = {
                    amount: response.data.data.amount / 100, // Convert amount from kobo to naira
                    currency: response.data.data.currency,
                    transactionDate: response.data.data.transaction_date,
                    authorizationCode: response.data.data.authorization.authorization_code,
                    reference: response.data.data.reference,
                    userId: userId,
                    caseId: caseId,
                    accessType: access_type,
                };
                //Save payment details=
                const payment = new payment_1.default({
                    userId: userId,
                    amount: paymentDetails.amount,
                    reference: paymentDetails.reference,
                    status: response.data.data.status,
                    paid_at: paymentDetails.transactionDate,
                    ip_address: req.ip,
                    accessType: access_type,
                    authorization_code: paymentDetails.authorizationCode,
                    caseId: caseId,
                    paymentDetails
                });
                yield payment.save();
                // Log the activity
                const activityLog = new activityLog_1.default({
                    userId: userId,
                    action: 'Search',
                    entityType: 'Case',
                    entityId: caseId,
                    caseId: caseId,
                    reference: paymentDetails.reference
                });
                yield activityLog.save();
                return SuccessHandler_1.default.sendCustomSuccess(res, 200, "Payment Successful", paymentDetails);
            }
            else {
                return errorHandler_1.default.sendError(res, 400, 'Payment failed: ' + response.data.data.gateway_response);
            }
        }))
            .catch(error => {
            // Handle error
            console.error('Error:', error.response ? error.response.data : error.message);
            if (error.response && error.response.data) {
                const responseData = error.response.data;
                return errorHandler_1.default.sendError(res, 400, 'Payment failed: ' + responseData.data.message);
            }
            else {
                return errorHandler_1.default.sendError(res, 500, 'An error occurred while processing your request.');
            }
        });
    }
    catch (error) {
        console.error(error);
        errorHandler_1.default.sendError(res, 400, 'Error: ' + error.message);
        return res.sendStatus(400);
    }
});
exports.searchAndDownload = searchAndDownload;
// Function to generate a random password
const generateRandomPassword = () => {
    const length = 6; // You can adjust the length of the password as needed
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
//Download certification
const downloadCertificate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const reference = req.params.reference;
        // Check if reference number is correct
        const payment = yield payment_1.default.findOne({ reference });
        if (!payment) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid reference number');
        }
        // Check if user id is correct
        const user = yield users_2.default.findById(userId);
        if (!user) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user id');
        }
        // Get case id from payment based on reference
        const caseId = payment.caseId;
        try {
            new mongoose_1.default.Types.ObjectId(caseId);
        }
        catch (error) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid ObjectId');
        }
        const caseExists = yield cases_1.default.findById(caseId);
        if (!caseExists) {
            return errorHandler_1.default.sendError(res, 400, 'Case not found');
        }
        //console.log(caseExists);
        //const registrar = await UserModel.findById(caseExists.registrarId);
        const registrar = yield users_2.default.findOne({
            isAcr: true,
            judicialDivision: caseExists.courtDivision
        });
        console.log(caseExists.court + ' ' + caseExists.courtDivision);
        if (!registrar) {
            return errorHandler_1.default.sendError(res, 400, 'Acr Litigation Registrar not found');
        }
        // Create a new PDF document
        const doc = new pdfkit_1.default();
        // Set content-disposition header to force download
        res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
        // Pipe the PDF document to the response stream
        doc.pipe(res);
        const updatedAtString = caseExists.updatedAt;
        const updatedAtDate = new Date(updatedAtString);
        const formattedDate = updatedAtDate.toLocaleString();
        const currentDate = new Date();
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1; // Month is zero-based, so we add 1
        const year = currentDate.getFullYear();
        // Get created date
        const createdAtString = caseExists.createdAt;
        const createdAtDate = new Date(createdAtString);
        const formattedDateCreatedAt = createdAtDate.toLocaleString();
        // Format the date using moment
        const createdAtMoment = (0, moment_1.default)(createdAtString);
        const formattedDateCreatedAt2 = createdAtMoment.format("MMMM Do YYYY, h:mm:ss A");
        // Certification text
        const certificationText = `This is to certify that on the ${createdAtMoment.format("Do")} day of ${createdAtMoment.format("MMMM")} ${createdAtMoment.format("YYYY")}, this action was commenced in this court and remains on file and record. According to the record.`;
        // Add content to the PDF document
        doc.font('Helvetica').fontSize(12);
        doc.font('Helvetica-Bold').fontSize(13).text('IN THE HIGH COURT OF ENUGU STATE', { align: 'center' });
        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(12);
        doc.font('Helvetica-Bold').fontSize(13).text('HOLDEN AT ENUGU', { align: 'center' });
        doc.moveDown(0.9);
        doc.font('Helvetica').fontSize(12);
        doc.font('Helvetica-Bold').fontSize(13).text('CERTIFICATE OF LISPENDES', { align: 'center' });
        doc.moveDown(0.9);
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(caseExists.court, { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(caseExists.courtDivision, { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(`Title Registration No: ` + caseExists.registeredTitleNumber, { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(`Property Address: ` + caseExists.plotStreetName + ' ' + caseExists.city + ' ' + caseExists.lga + ' ' + caseExists.state, { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(`Name of Title Owner: ` + caseExists.propertyOwner, { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(`Name of Parties: ` + caseExists.nameParties, { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(`Suit No: ` + caseExists.suitNumber, { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(`Status of Case: ` + caseExists.statusDispute, { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(`Relief of Sough: ` + caseExists.natureDispute, { align: 'left' });
        doc.moveDown(1.9);
        doc.font('Helvetica-Bold').fontSize(13).text('To Whom It May Concern', { align: 'center' });
        doc.moveDown(0.9);
        doc.font('Helvetica').fontSize(12).text(`This certificate of Lis Pendes serves to inform all potential buyers, lenders, and other interested parties that the property above is the subject of litigation and any transactions involving the property may be subject to the outcome of the pending litigation. Transactions or dealings with the property should be conducted with full awarenesss of the ongoing litigation.`, { align: 'justify' });
        doc.moveDown(0.5);
        const todayDate = `${day}-${month}-${year}`;
        doc.font('Helvetica').fontSize(12).text(`Search Date: ` + todayDate, { align: 'justify' });
        doc.moveDown(0.5);
        doc.moveDown(0.5);
        doc.moveDown(0.5);
        doc.moveDown(0.5);
        doc.moveDown(0.5);
        doc.font('Helvetica').text('Signature:');
        doc.moveDown(0.5);
        // Fetch the registrar's signature image from Cloudinary and add it to the PDF
        const signatureUrl = registrar.registrarSignature;
        if (signatureUrl) {
            const response = yield axios_1.default.get(signatureUrl, { responseType: 'arraybuffer' });
            const signatureBuffer = Buffer.from(response.data, 'binary');
            doc.image(signatureBuffer, undefined, undefined, {
                fit: [150, 50],
                //align: 'left',
                //valign: 'top'
            });
            doc.moveDown(1);
        }
        doc.font('Helvetica').text(registrar.firstName + " " + registrar.lastName);
        doc.moveDown(0.5);
        doc.font('Helvetica').text("ACR Litigation");
        doc.moveDown(0.9);
        // Fetch the registrar's signature image from Cloudinary and add it to the PDF
        const sealUrl = registrar.registrarSeal;
        if (sealUrl) {
            const response = yield axios_1.default.get(sealUrl, { responseType: 'arraybuffer' });
            const sealBuffer = Buffer.from(response.data, 'binary');
            doc.image(sealBuffer, undefined, undefined, {
                fit: [150, 50],
                //valign: 'center',
                align: 'center',
                //valign: 'top'
            });
            doc.moveDown(1);
        }
        doc.font('Helvetica').fontSize(11).text(`For any further information or clarification, please contact the court at ${caseExists.court} ${caseExists.courtDivision}.`, { align: 'justify' });
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`This certificate is issued in accordance with the legal requirements and serves as a public notice of the ongoing litigation affecting the described property as the search date. This notice is for informational purposes only and does not constitute legal advice.`, { align: 'justify' });
        // Finalize the PDF document
        doc.end();
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.downloadCertificate = downloadCertificate;
//send certificate via email
const sendCertificate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const reference = req.params.reference;
        //check if reference number correct
        const payment = yield payment_1.default.findOne({ reference: reference });
        if (!payment) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid reference number');
        }
        //check if user id is valid
        const user = yield users_2.default.findById(userId);
        if (!user) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid user id');
        }
        const emailAddress = user.email; // Replace with the recipient's email address
        // Generate the PDF certificate
        const pdfFilePath = yield (0, exports.generateCertificate)(userId, reference, emailAddress);
        // Send the success response
        res.status(200).json({ message: 'Certificate sent successfully' });
    }
    catch (error) {
        console.error('Error sending certificate:', error);
        res.status(500).json({ error: 'Failed to send certificate' });
    }
});
exports.sendCertificate = sendCertificate;
const generateCertificate = (userId, reference, emailAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create a new PDF document
        const doc = new pdfkit_1.default();
        // Add content to the PDF document (your existing content)
        // Add content to the PDF document
        doc.font('Helvetica').fontSize(12);
        doc.text(`Last updated on: ${formatDate("10-12-2023")}`, { align: 'left' });
        doc.moveDown(1.9);
        doc.font('Helvetica-Bold').fontSize(16).text('CERTIFICATE OF LIS PENDENS', { align: 'center' });
        doc.moveDown(0.9);
        doc.font('Helvetica').text('This is to certify that on the --------- day of ----------------- 20-----, this action was commenced in this court and remains on file and record. According to the record:');
        doc.moveDown(0.5);
        doc.text('The names of the parties to this action are: ');
        doc.text('A description of the real estate affected is/are: ');
        doc.text('The nature of the claim sought is: ');
        doc.text('The status of the case as of (date)  is: ');
        doc.moveDown(0.5);
        doc.text('This serves to notify all stakeholders in the aforesaid property of its current status and to inform that this information is constantly updated and therefore the above status is subject to change at short notice. ');
        doc.moveDown(0.5);
        doc.text('Signed by the Court Registrar.');
        doc.moveDown(0.9);
        doc.font('Helvetica-Bold').fontSize(15).text('DISCLAIMER', { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica').text(`Please note that while we strive to ensure that the information provided through our services & platform is accurate and thoroughly vetted, it is important to note that our role is advisory. We do not replace the courts or relevant registries. The information we provide is informative only and should not be construed as legal advice. It may not always reflect the current accurate status of every case on our database. Therefore, it is the responsibility of the user to conduct further research to obtain the most current status of any case related to a property of interest. Our Terms & Conditions will outline these guidelines. We cannot be held liable for any actions taken by a user or property owner based on the information, even if our internal processes have thoroughly vetted it.`, { align: 'justify' });
        // Save the PDF document to a file
        const pdfFilePath = 'certificate.pdf';
        doc.pipe(fs_1.default.createWriteStream(pdfFilePath));
        doc.end();
        // Send the email with the PDF attachment
        yield (0, mail_1.sendCertificateEmail)(emailAddress, pdfFilePath);
        console.log('Certificate generated and sent successfully');
        return pdfFilePath;
    }
    catch (error) {
        console.error('Error generating certificate:', error);
        throw new Error('Failed to generate certificate');
    }
});
exports.generateCertificate = generateCertificate;
function formatDate(date) {
    // Assuming the input date format is YYYY-MM-DD
    const parts = date.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
