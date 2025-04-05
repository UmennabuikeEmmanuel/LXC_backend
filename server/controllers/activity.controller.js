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
exports.deleteLog = exports.getActivityDetails = exports.getAllCourtActivities = exports.getAllNewActivities = exports.getAllActivities = void 0;
const activityLog_1 = __importDefault(require("../db/activityLog"));
const SuccessHandler_1 = __importDefault(require("../utils/SuccessHandler"));
const cases_1 = require("../db/cases");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get all activities related to cases
const ITEMS_PER_PAGE = 10;
const getAllActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        // Query to retrieve activity logs related to cases
        const logs = yield activityLog_1.default.find({ entityType: 'Case' })
            .populate('userId', 'firstName lastName email')
            .populate({
            path: 'entityId',
            model: cases_1.CaseModel,
            select: 'nameParties statusDispute createdAt updatedAt'
        })
            .select('action entityType entityId actionDetails')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ITEMS_PER_PAGE)
            .lean();
        const totalLogsCount = yield activityLog_1.default.countDocuments({ entityType: 'Case' });
        // Count total uploads
        const totalUpload = yield activityLog_1.default.countDocuments({ entityType: 'Case', action: 'Uploaded' });
        // Count total updates
        const totalUpdate = yield activityLog_1.default.countDocuments({ entityType: 'Case', action: 'Updated' });
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Case logs fetched successfully', {
            logs,
            totalActivities: totalLogsCount,
            currentPage: page,
            totalPages: Math.ceil(totalLogsCount / ITEMS_PER_PAGE),
            totalUpload,
            totalUpdate,
        });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getAllActivities = getAllActivities;
// Get all activities related to cases
const getAllNewActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const logs = yield activityLog_1.default.find({ entityType: 'Case' }) // Filter logs by entityType 'Case'
            .populate('userId', 'firstName lastName email') // Populate user details
            .populate({
            path: 'entityId',
            model: cases_1.CaseModel, // Use the CaseModel for population
            select: 'nameParties statusDispute createdAt updatedAt'
        })
            .select('action entityType entityId actionDetails createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ITEMS_PER_PAGE)
            .lean();
        // Loop through the logs array
        logs.forEach((log) => {
            const createdAt = log.entityId._id.getTimestamp();
            console.log(createdAt);
        });
        logs.forEach((log) => {
            // Attempt to parse the createdAt timestamp using Date.parse
            const date = new Date(Date.parse(log.entityId._id.getTimestamp()));
            // Check if the parsed date is valid
            if (!isNaN(date.getTime())) {
                // Get the day of the month
                const dayOfMonth = date.getDate();
                // Get the month name
                const month = date.toLocaleString('en-US', { month: 'long' });
                // Get the abbreviated day name
                const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
                log.timestamp = `${dayOfMonth} ${month} ${dayOfWeek}`;
            }
            else {
                log.timestamp = "Invalid Date";
            }
        });
        const totalLogsCount = yield activityLog_1.default.countDocuments({ entityType: 'Case' }); // Count only case logs
        // Filter logs for uploads
        const uploadedLogs = logs.filter(log => log.action === 'Uploaded');
        const totalUpload = uploadedLogs.length;
        // Filter logs for updates
        const updatedLogs = logs.filter(log => log.action === 'Updated');
        const totalUpdate = updatedLogs.length;
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Case logs fetched successfully', {
            logs,
            totalActivities: totalLogsCount,
            currentPage: page,
            totalPages: Math.ceil(totalLogsCount / ITEMS_PER_PAGE),
            uploadedLogs,
            totalUpload,
            updatedLogs,
            totalUpdate,
        });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getAllNewActivities = getAllNewActivities;
// Get all court activites
const getAllCourtActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const userId = req.user.userId;
        // Query to retrieve activity logs related to cases
        const logs = yield activityLog_1.default.find({ entityType: 'Case', userId: userId })
            .populate('userId', 'firstName lastName email photoUrl') // Populate user details
            .populate({
            path: 'entityId',
            model: cases_1.CaseModel, // Use the CaseModel for population
            select: 'nameParties statusDispute createdAt updatedAt'
        })
            .select('action entityType entityId actionDetails')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ITEMS_PER_PAGE)
            .lean();
        const totalLogsCount = yield activityLog_1.default.countDocuments({ entityType: 'Case' }); // Count only case logs
        // Count total uploads
        const totalUpload = yield activityLog_1.default.countDocuments({ entityType: 'Case', action: 'Uploaded' });
        // Count total updates
        const totalUpdate = yield activityLog_1.default.countDocuments({ entityType: 'Case', action: 'Updated' });
        // Send response with logs, total count, pagination info, total uploads, and total updates
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Case logs fetched successfully', {
            logs,
            totalActivities: totalLogsCount,
            currentPage: page,
            totalPages: Math.ceil(totalLogsCount / ITEMS_PER_PAGE),
            totalUpload,
            totalUpdate,
        });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getAllCourtActivities = getAllCourtActivities;
const getActivityDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log(id);
        // Query to retrieve activity logs related to cases
        const details = yield activityLog_1.default.find({ _id: id })
            .populate('userId', 'firstName lastName email photoUrl') // Populate user details
            .populate({
            path: 'entityId',
            model: cases_1.CaseModel, // Use the CaseModel for population
        })
            .select('action entityType entityId lastUpdate previousStatus actionDetails')
            .lean();
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Activity detailed fetched successfully', {
            details
        });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getActivityDetails = getActivityDetails;
// Delete a log record by ID
const deleteLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorHandler_1.default.sendError(res, 400, 'Invalid log id');
        }
        // Find the log record by ID and delete it
        const deletedLog = yield activityLog_1.default.findByIdAndDelete(id);
        if (!deletedLog) {
            return errorHandler_1.default.sendError(res, 404, 'Log record not found');
        }
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Log record deleted successfully', deletedLog);
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.deleteLog = deleteLog;
