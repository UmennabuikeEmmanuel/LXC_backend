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
exports.updateTest = exports.downloadFlaggedCasesAsPDF = exports.unflagCase = exports.getFlaggedCases = exports.flagCase = exports.generateCertificate = exports.searchByValues = exports.uploadCasesCSV = exports.getCaseByValues = exports.getCaseById = exports.deleteCase = exports.updateCaseStatus = exports.updateCase = exports.getAllCasesRegistrar = exports.getAllCases = exports.addNewCase = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const cases_1 = require("../db/cases");
const SuccessHandler_1 = __importDefault(require("../utils/SuccessHandler"));
const users_1 = __importDefault(require("../db/users"));
const cases_2 = __importDefault(require("../db/cases"));
const mongoose_1 = __importDefault(require("mongoose"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const multer_1 = __importDefault(require("multer"));
const streamifier = __importStar(require("streamifier"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const flags_1 = __importDefault(require("../db/flags"));
const activityLog_1 = __importDefault(require("../db/activityLog"));
const pdf_utils_1 = require("../utils/pdf.utils");
const addNewCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            propertyTitle: joi_1.default.string().required(),
            propertyOwner: joi_1.default.string().required(),
            registeredTitleNumber: joi_1.default.string().required(),
            plotStreetName: joi_1.default.string(),
            state: joi_1.default.string(),
            lga: joi_1.default.string(),
            city: joi_1.default.string(),
            surveyPlanNumber: joi_1.default.string().required(),
            nameParties: joi_1.default.string().required(),
            suitNumber: joi_1.default.string().required(),
            court: joi_1.default.string().required(),
            natureDispute: joi_1.default.string().required(),
            courtDivision: joi_1.default.string().required(),
            plotNumber: joi_1.default.string().required(),
            statusDispute: joi_1.default.string().valid('Pending', 'On appeal', 'Disposed').required(),
            dateCommencement: joi_1.default.date().optional(),
            disposed: joi_1.default.string(),
            registrarId: joi_1.default.string(),
        });
        //Set registrarId 
        const role = req.user.role;
        let registrarId;
        if (role === 'registrar') {
            registrarId = req.user.userId;
        }
        else {
            registrarId = req.body.registrarId;
        }
        if (!registrarId) {
            return errorHandler_1.default.sendError(res, 400, 'Registrar ID is required');
        }
        const permissions = req.user.permission;
        console.log(permissions);
        if (!permissions.includes('Upload access')) {
            return errorHandler_1.default.sendError(res, 403, 'Access denied. You are not authorized to perform this action');
        }
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { plotStreetName, state, city, lga, propertyTitle, plotNumber, propertyOwner, registeredTitleNumber, propertyLocation, surveyPlanNumber, nameParties, suitNumber, natureDispute, courtDivision, statusDispute, dateCommencement, disposed, court } = req.body;
        const existingCase = yield (0, cases_1.getCaseBySuitNumber)(suitNumber);
        if (existingCase) {
            return errorHandler_1.default.sendError(res, 400, 'Case with this suitNumber already exists');
        }
        const userId = req.user.userId;
        const newCase = {
            propertyTitle,
            propertyOwner,
            registeredTitleNumber,
            court,
            plotStreetName,
            plotNumber,
            state,
            city,
            lga,
            surveyPlanNumber,
            nameParties,
            suitNumber,
            natureDispute,
            courtDivision,
            statusDispute,
            dateCommencement,
            disposed,
            userId,
            registrarId
        };
        const cases = yield (0, cases_1.createCase)(newCase);
        // Log the activity
        const activityLog = new activityLog_1.default({
            userId: req.user.userId, //Get logged userid
            action: 'Uploaded',
            entityType: 'Case',
            entityId: cases._id
        });
        yield activityLog.save();
        return res.status(200).json({ success: true, message: 'New case uploaded successfully', cases }).end();
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});
exports.addNewCase = addNewCase;
// Get all cases for superadmin
const ITEMS_PER_PAGE = 10;
const getAllCases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const cases = yield cases_2.default.find({ isFlagged: false, isArchive: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ITEMS_PER_PAGE)
            .lean();
        const totalCasesCount = yield cases_2.default.countDocuments({ isFlagged: false, isArchive: false });
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Cases fetched successfully', {
            cases,
            totalCases: totalCasesCount,
            currentPage: page,
            totalPages: Math.ceil(totalCasesCount / ITEMS_PER_PAGE),
        });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getAllCases = getAllCases;
//get all cases by admin (registrar)
const getAllCasesRegistrar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const cases = yield cases_2.default.find({ isFlagged: false, registrarId: userId, isArchive: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ITEMS_PER_PAGE)
            .lean();
        const totalCasesCount = yield cases_2.default.countDocuments({ isFlagged: false, userId: userId, isArchive: false });
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Cases fetched successfully', {
            cases,
            totalCases: totalCasesCount,
            currentPage: page,
            totalPages: Math.ceil(totalCasesCount / ITEMS_PER_PAGE),
        });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getAllCasesRegistrar = getAllCasesRegistrar;
//Udate case by id
const updateCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            propertyTitle: joi_1.default.string().required(),
            propertyOwner: joi_1.default.string().required(),
            registeredTitleNumber: joi_1.default.string().required(),
            plotStreetName: joi_1.default.string(),
            plotNumber: joi_1.default.string(),
            state: joi_1.default.string(),
            lga: joi_1.default.string(),
            city: joi_1.default.string(),
            court: joi_1.default.string(),
            surveyPlanNumber: joi_1.default.string().required(),
            nameParties: joi_1.default.string().required(),
            suitNumber: joi_1.default.string().required(),
            natureDispute: joi_1.default.string().required(),
            courtDivision: joi_1.default.string().required(),
            statusDispute: joi_1.default.string().valid('Pending', 'On appeal', 'Disposed').required(),
            dateCommencement: joi_1.default.date().optional(),
            disposed: joi_1.default.string()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const permissions = req.user.permission;
        console.log(permissions);
        if (!permissions.includes('Edit access')) {
            return errorHandler_1.default.sendError(res, 403, 'Access denied. You are not authorized to perform this action');
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid case ID');
        }
        const cases = yield cases_2.default.findById(id);
        if (!cases) {
            return errorHandler_1.default.sendError(res, 404, 'Case not found');
        }
        cases.propertyTitle = req.body.propertyTitle,
            cases.propertyOwner = req.body.propertyOwner,
            cases.registeredTitleNumber = req.body.registeredTitleNumber,
            cases.plotStreetName = req.body.plotStreetName,
            cases.city = req.body.city,
            cases.court = req.body.court,
            cases.lga = req.body.lga,
            cases.state = req.body.state,
            cases.surveyPlanNumber = req.body.surveyPlanNumber,
            cases.nameParties = req.body.nameParties,
            cases.suitNumber = req.body.suitNumber,
            cases.natureDispute = req.body.natureDispute,
            cases.courtDivision = req.body.courtDivision,
            cases.plotNumber = req.body.plotNumber,
            cases.statusDispute = req.body.statusDispute,
            cases.dateCommencement = req.body.dateCommencement,
            cases.disposed = req.body.disposed;
        const previousStatus = cases.statusDispute;
        const lastUpdate = cases.updatedAt;
        yield cases.save();
        // Log the activity
        const activityLog = new activityLog_1.default({
            userId: req.user.userId, //Get logged userid
            action: 'Updated',
            entityType: 'Case',
            entityId: id,
            previousStatus: previousStatus,
            lastUpdate
        });
        yield activityLog.save();
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Case updated successfully', cases);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.updateCase = updateCase;
//Udate case status by id
const updateCaseStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            statusDispute: joi_1.default.string().valid('Pending', 'On appeal', 'Disposed').required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return errorHandler_1.default.sendError(res, 400, error.details[0].message);
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid case ID');
        }
        const cases = yield cases_2.default.findById(id);
        if (!cases) {
            return errorHandler_1.default.sendError(res, 404, 'Case not found');
        }
        cases.statusDispute = req.body.statusDispute;
        const previousStatus = cases.statusDispute;
        const lastUpdate = cases.updatedAt;
        yield cases.save();
        // Log the activity
        const activityLog = new activityLog_1.default({
            userId: req.user.userId,
            action: 'Updated',
            entityType: 'Case',
            entityId: id,
            previousStatus: previousStatus,
            lastUpdate: lastUpdate
        });
        try {
            yield activityLog.save();
        }
        catch (error) {
            console.error('Error saving activity log:', error);
            return errorHandler_1.default.sendError(res, 500, 'Failed to save activity log');
        }
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Case status updated successfully', cases);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.updateCaseStatus = updateCaseStatus;
//Delete case
const deleteCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid case ID');
        }
        const caseToArchive = yield cases_2.default.findById(id);
        if (!caseToArchive) {
            return errorHandler_1.default.sendError(res, 404, 'Case not found');
        }
        const permissions = req.user.permission;
        console.log(permissions);
        if (!permissions.includes('Delete access')) {
            return errorHandler_1.default.sendError(res, 403, 'Access denied. You are not authorized to perform this action');
        }
        // Update the case to mark it as archived
        caseToArchive.isArchive = true;
        yield caseToArchive.save();
        // Log the activity
        const activityLog = new activityLog_1.default({
            userId: req.user.userId,
            action: 'Deleted',
            entityType: 'Case',
            entityId: id
        });
        yield activityLog.save();
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Case deleted successfully', caseToArchive);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.deleteCase = deleteCase;
// Get a case by its ID
const getCaseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const caseId = req.params.id;
        try {
            new mongoose_1.default.Types.ObjectId(caseId);
        }
        catch (error) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid ObjectId');
        }
        const foundCase = yield cases_2.default.findById(caseId).lean();
        if (!foundCase) {
            return errorHandler_1.default.sendError(res, 404, 'Case not found');
        }
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Case fetched successfully', { case: foundCase });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getCaseById = getCaseById;
// Get cases by search criteria
const getCaseByValues = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchCriteria = req.body;
        if (!searchCriteria || Object.keys(searchCriteria).length === 0) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid search criteria');
        }
        const query = {};
        // Add conditions to query based on search criteria
        if (searchCriteria.propertyTitle) {
            query.propertyTitle = { $regex: new RegExp(searchCriteria.propertyTitle, 'i') };
        } 
        if (searchCriteria.propertyOwner) {
            query.propertyOwner = { $regex: new RegExp(searchCriteria.propertyOwner, 'i') };
        }
        if (searchCriteria.registeredTitleNumber) {
            query.registeredTitleNumber = searchCriteria.registeredTitleNumber;
        } 
        if (searchCriteria.propertyLocation) {
            query.propertyLocation = { $regex: new RegExp(searchCriteria.propertyLocation, 'i') };
        }
         if (searchCriteria.surveyPlanNumber) {
            query.surveyPlanNumber = searchCriteria.surveyPlanNumber;
        }
         query.isFlagged = false;

        const foundCases = yield cases_2.default.find(query).lean();
        if (foundCases.length === 0) {
            return errorHandler_1.default.sendError(res, 404, 'No cases found');
        }
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Cases fetched successfully', { cases: foundCases });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getCaseByValues = getCaseByValues;
//Upload cases by csvfile
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const csvCaseUpload = upload.single('csvFile'); // Assumes the file input field is named 'csvFile'
const uploadCasesCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        csvCaseUpload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return errorHandler_1.default.sendError(res, 400, 'Error uploading Case CSV file');
            }
            if (!req.file) {
                return errorHandler_1.default.sendError(res, 400, 'No CSV file uploaded');
            }
            const csvData = [];
            const csvFileBuffer = req.file.buffer.toString();
            yield new Promise((resolve, reject) => {
                streamifier.createReadStream(Buffer.from(csvFileBuffer))
                    .pipe((0, csv_parser_1.default)())
                    .on('data', (row) => {
                    csvData.push(row);
                })
                    .on('end', () => {
                    resolve();
                })
                    .on('error', (error) => {
                    reject(error);
                });
            });
            if (csvData.length === 0) {
                return errorHandler_1.default.sendError(res, 400, 'Invalid CSV file format');
            }
            const createdCases = yield Promise.all(csvData.map((csvRow) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const schema = joi_1.default.object({
                        propertyTitle: joi_1.default.string().required(),
                        propertyOwner: joi_1.default.string().required(),
                        registeredTitleNumber: joi_1.default.string().required(),
                        plotStreetName: joi_1.default.string(),
                        state: joi_1.default.string(),
                        lga: joi_1.default.string(),
                        city: joi_1.default.string(),
                        court: joi_1.default.string(),
                        surveyPlanNumber: joi_1.default.string().required(),
                        nameParties: joi_1.default.string().required(),
                        suitNumber: joi_1.default.string().required(),
                        natureDispute: joi_1.default.string().required(),
                        courtDivision: joi_1.default.string().required(),
                        plotNumber: joi_1.default.string().required(),
                        statusDispute: joi_1.default.string().required(),
                        dateCommencement: joi_1.default.date().optional(),
                        disposed: joi_1.default.string(),
                    });
                    const { error } = schema.validate(csvRow); // Type assertion
                    if (error) {
                        throw new Error(`Invalid CSV row format: ${error.details[0].message}`);
                    }
                    const suitNumberExists = yield (0, cases_1.getCaseBySuitNumber)(csvRow.suitNumber);
                    if (suitNumberExists) {
                        throw new Error(`Case with suitNumber ${csvRow.suitNumber} already exists`);
                    }
                    const newCase = Object.assign({}, csvRow);
                    return (0, cases_1.createCase)(newCase);
                }
                catch (error) {
                    return error;
                }
            })));
            const errors = createdCases.filter((result) => result instanceof Error);
            if (errors.length > 0) {
                const errorMessages = errors.map((error) => error.message).join(', ');
                return errorHandler_1.default.sendError(res, 400, `Errors during case creation: ${errorMessages}`);
            }
            SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Cases created from CSV successfully', { cases: createdCases });
        }));
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.uploadCasesCSV = uploadCasesCSV;
// Guest search by values
const searchByValues = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchCriteria = req.body;
        const query = {};
        // Add conditions to the query object based on provided search criteria
        if (searchCriteria.propertyTitle) {
            query.propertyTitle = searchCriteria.propertyTitle;
        }
        if (searchCriteria.registeredTitleNumber) {
            query.registeredTitleNumber = searchCriteria.registeredTitleNumber;
        }
        if (searchCriteria.state) {
            query.state = searchCriteria.state;
        }
        if (searchCriteria.plotNumber) {
            query.plotNumber = searchCriteria.plotNumber;
        }
        if (searchCriteria.lga) {
            query.lga = searchCriteria.lga;
        }
        if (searchCriteria.city) {
            query.city = searchCriteria.city;
        }
        if (searchCriteria.surveyPlanNumber) {
            query.surveyPlanNumber = searchCriteria.surveyPlanNumber;
        }
        if (searchCriteria.propertyOwner) {
            query.propertyOwner = searchCriteria.propertyOwner;
        }
        if (searchCriteria.plotStreetName) {
            query.plotStreetName = searchCriteria.plotStreetName;
        }
        // Execute the query
        const foundCases = yield cases_2.default.find(query).lean();
        // If no matches are found, return a "not found" response
        if (foundCases.length === 0) {
            return errorHandler_1.default.sendError(res, 404, 'No matching records found');
        }
        // Add search criteria to each result object
        const resultsWithCriteria = foundCases.map((foundCase) => {
            const matchedCriteria = {};
            if (foundCase.propertyTitle === searchCriteria.propertyTitle) {
                matchedCriteria.propertyTitle = searchCriteria.propertyTitle;
            }
            if (foundCase.registeredTitleNumber === searchCriteria.registeredTitleNumber) {
                matchedCriteria.registeredTitleNumber = searchCriteria.registeredTitleNumber;
            }
            if (foundCase.state === searchCriteria.state) {
                matchedCriteria.state = searchCriteria.state;
            }
            if (foundCase.lga === searchCriteria.lga) {
                matchedCriteria.lga = searchCriteria.lga;
            }
            if (foundCase.city === searchCriteria.city) {
                matchedCriteria.city = searchCriteria.city;
            }
            return Object.assign(Object.assign({}, foundCase), { matchedCriteria });
        });
        // Send the response with the found cases
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Property fetched successfully', { cases: resultsWithCriteria });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.searchByValues = searchByValues;
const generateCertificate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        const caseId = req.params.id;
        try {
            new mongoose_1.default.Types.ObjectId(caseId);
        }
        catch (error) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid ObjectId');
        }
        const caseExists = yield cases_2.default.findById(caseId);
        if (!caseExists) {
            return errorHandler_1.default.sendError(res, 400, 'Case not found');
        }
        const doc = new pdfkit_1.default();
        res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
        doc.pipe(res);
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
        doc.moveDown(0.9);
        doc.font('Helvetica-Bold').fontSize(16).text('DISCLAIMER', { align: 'left' });
        doc.moveDown(0.5);
        doc.font('Helvetica').text(`Please note that while we strive to ensure that the information provided through our services & platform is accurate and thoroughly vetted, it is important to note that our role is advisory. We do not replace the courts or relevant registries. The information we provide is informative only and should not be construed as legal advice. It may not always reflect the current accurate status of every case on our database. Therefore, it is the responsibility of the user to conduct further research to obtain the most current status of any case related to a property of interest. Our Terms & Conditions will outline these guidelines. We cannot be held liable for any actions taken by a user or property owner based on the information, even if our internal processes have thoroughly vetted it.`, { align: 'justify' });
        doc.end();
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.generateCertificate = generateCertificate;
function formatDate(date) {
    const parts = date.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
// Flag a case
const flagCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const caseId = req.params.id;
        const userId = req.user.userId;
        // Check if the caseId is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(caseId)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid ObjectId');
        }
        // Find the case by ID
        const foundCase = yield cases_2.default.findById(caseId).lean();
        if (!foundCase) {
            return errorHandler_1.default.sendError(res, 404, 'Case not found');
        }
        // Create a new flag document
        const flag = new flags_1.default({ userId, caseId });
        try {
            yield flag.save();
            // Update the isFlagged field in the Case document
            yield cases_2.default.findByIdAndUpdate(caseId, { isFlagged: true });
            // Fetch user details
            const user = yield users_1.default.findById(userId).lean();
            // Log the activity
            const activityLog = new activityLog_1.default({
                userId: req.user.userId, //Get logged userid
                action: 'Flagged case',
                entityType: 'Flag',
                entityId: caseId
            });
            return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Case has been flagged successfully', { flag, case: foundCase, user });
        }
        catch (error) {
            return errorHandler_1.default.sendError(res, 400, 'Failed to flag case: ' + error);
        }
    }
    catch (error) {
        return errorHandler_1.default.sendError(res, 500, 'Failed to flag case: ' + error);
    }
});
exports.flagCase = flagCase;
const getFlaggedCases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const role = req.user.role;
        const user = req.user.userId;
        let flaggedCases;
        if (role === 'superadmin') {
            flaggedCases = yield flags_1.default.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
        }
        else {
            flaggedCases = yield flags_1.default.find({ userId: user })
                .skip(skip)
                .limit(limit)
                .lean();
        }
        const totalCount = yield flags_1.default.countDocuments(role === 'superadmin' ? {} : { userId: user });
        // If no flagged cases found, return an empty array
        if (!flaggedCases || flaggedCases.length === 0) {
            return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'No flagged cases found', {
                flaggedCases: [],
                totalFlagCases: 0,
                currentPage: page,
                totalPages: 0,
            });
        }
        // Fetch case and user details for each flagged case
        const flaggedCasesWithDetails = yield Promise.all(flaggedCases.map((flaggedCase) => __awaiter(void 0, void 0, void 0, function* () {
            const caseDetails = yield cases_2.default.findById(flaggedCase.caseId)
                .select('nameParties statusDispute createdAt updatedAt')
                .lean();
            const userDetails = yield users_1.default.findById(flaggedCase.userId)
                .select('firstName lastName')
                .lean();
            return Object.assign(Object.assign({}, flaggedCase), { caseDetails, userDetails });
        })));
        const totalPages = Math.ceil(totalCount / limit);
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Flagged cases retrieved successfully', {
            flaggedCases: flaggedCasesWithDetails,
            totalFlagCases: totalCount,
            currentPage: page,
            totalPages: totalPages,
        });
    }
    catch (error) {
        return errorHandler_1.default.sendError(res, 500, 'Failed to retrieve flagged cases: ' + error);
    }
});
exports.getFlaggedCases = getFlaggedCases;
// Unflag a case
const unflagCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const caseId = req.params.id;
        const userId = req.user.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(caseId)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid ObjectId');
        }
        const deletedFlag = yield flags_1.default.findOneAndDelete({ caseId, userId });
        if (!deletedFlag) {
            return errorHandler_1.default.sendError(res, 404, 'Flag not found for this case');
        }
        yield cases_2.default.findByIdAndUpdate(caseId, { isFlagged: false });
        // Log the activity
        const activityLog = new activityLog_1.default({
            userId: req.user.userId, //Get logged userid
            action: 'Removed flagged case',
            entityType: 'Flag',
            entityId: caseId
        });
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Case has been unflagged successfully');
    }
    catch (error) {
        return errorHandler_1.default.sendError(res, 500, 'Failed to unflag case: ' + error);
    }
});
exports.unflagCase = unflagCase;
// Endpoint to download flagged cases as PDF
const downloadFlaggedCasesAsPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const caseId = req.params.id;
        const userId = req.user.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(caseId)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid ObjectId');
        }
        // Find the flagged case associated with the provided ID
        const flaggedCase = yield flags_1.default.findById(caseId);
        if (!flaggedCase) {
            return errorHandler_1.default.sendError(res, 404, 'Flag not found for this case');
        }
        const associatedCase = yield cases_2.default.findById(flaggedCase.caseId).lean();
        if (!associatedCase) {
            return errorHandler_1.default.sendError(res, 404, 'Case not found for this flagged case2');
        }
        const doc = new pdfkit_1.default();
        // Set content-disposition header to force download
        res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
        doc.pipe(res);
        const today = new Date();
        // Add content to the PDF document
        doc.font('Helvetica').fontSize(12);
        doc.text(`Downloaded on: ${today}`, { align: 'left' });
        doc.moveDown(1.9);
        doc.font('Helvetica-Bold').fontSize(16).text('FLAGGED CASE', { align: 'center' });
        const parties = associatedCase.nameParties.split(', ');
        // Add table
        const tableData = [
            { Field: 'Parties', Value: parties[0] },
            { Field: 'Property', Value: associatedCase.propertyOwner },
            { Field: 'Status', Value: associatedCase.statusDispute },
            { Field: 'Suit Number', Value: associatedCase.suitNumber },
            { Field: 'Surver Plan Number', Value: associatedCase.surveyPlanNumber },
        ];
        (0, pdf_utils_1.drawTable)(doc, tableData, { x: 20, y: 180 });
        // Finalize the PDF document
        doc.end();
    }
    catch (error) {
        console.error('Error downloading flagged case details as PDF:', error);
        return res.status(500).json({ success: false, message: 'Failed to download flagged case details as PDF' });
    }
});
exports.downloadFlaggedCasesAsPDF = downloadFlaggedCasesAsPDF;
// Test route handler
const updateTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Access form-data fields
        const { firstName } = req.body;
        console.log(req.body.firstName);
        // Process the data as needed
        return SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Settings updated successfully', firstName);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.updateTest = updateTest;
