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
exports.totalCaseDisposed = exports.totalCaseOnappeal = exports.totalCasePending = exports.getRegistrarDashboard = exports.getUserSearches = exports.getUserDashboard = exports.dataReport = exports.getActivities = exports.getUsers = void 0;
const SuccessHandler_1 = __importDefault(require("../utils/SuccessHandler"));
const users_1 = __importDefault(require("../db/users"));
const activityLog_1 = __importDefault(require("../db/activityLog"));
const cases_1 = require("../db/cases");
const ITEMS_PER_PAGE_TEN = 10;
const ITEMS_PER_PAGE = 3;
//Superadmin dashboard
//Get  users limit by 3
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield users_1.default.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Users fetched successfully', {
            users,
        });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getUsers = getUsers;
// Get all activities related to cases 
const getActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        // Query to retrieve activity logs related to cases
        const logs = yield activityLog_1.default.find({ entityType: 'Case' }) // Filter logs by entityType 'Case'
            .populate('userId', 'firstName lastName email') // Populate user details
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
        const archivedCaseIds = yield cases_1.CaseModel.find({ isArchive: true }).distinct('_id');
        // Count activity logs excluding archived cases
        const totalLogsCount = yield activityLog_1.default.countDocuments({
            entityType: 'Case',
            'entityId': { $nin: archivedCaseIds }
        });
        // Count total uploads
        const totalUpload = yield cases_1.CaseModel.countDocuments();
        // Count total search
        const totalSearch = yield activityLog_1.default.countDocuments({
            entityType: 'Case',
            action: 'Search',
            isArchive: false,
            isFlagged: false,
            'entityId': { $nin: archivedCaseIds }
        });
        // Total pending
        const totalPending = yield cases_1.CaseModel.countDocuments({
            statusDispute: 'Pending',
            isFlagged: false,
            isArchive: false
        });
        //Total On appeal
        const totalAppeal = yield cases_1.CaseModel.countDocuments({
            statusDispute: 'On appeal',
            isFlagged: false,
            isArchive: false
        });
        //Total Disposed
        const totalDisposed = yield cases_1.CaseModel.countDocuments({
            statusDispute: 'Disposed',
            isFlagged: false,
            isArchive: false
        });
        // Count total updates
        const totalUpdate = yield activityLog_1.default.countDocuments({
            entityType: 'Case',
            action: 'Case update',
            isArchive: false,
            isFlagged: false,
            'entityId': { $nin: archivedCaseIds }
        });
        // Send response with logs, total count, pagination info, total uploads, and total updates
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Dashboard case logs fetched successfully', {
            logs,
            totalActivities: totalLogsCount,
            currentPage: page,
            totalPages: Math.ceil(totalLogsCount / ITEMS_PER_PAGE),
            totalUpload,
            totalPending,
            totalAppeal,
            totalDisposed,
            totalSearch,
            totalUpdate,
        });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getActivities = getActivities;
const dataReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(currentYear - 1);
        const totalSearch = yield activityLog_1.default.aggregate([
            {
                $match: {
                    entityType: 'Case',
                    action: 'Search',
                    timestamp: { $gte: twelveMonthsAgo, $lte: currentDate }
                }
            },
            {
                $group: {
                    _id: { $month: '$timestamp' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);
        // Initialize an object to store counts for each month
        const countsByMonth = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0
        };
        totalSearch.forEach(result => {
            const monthIndex = result._id - 1;
            const monthName = new Date(currentYear, monthIndex).toLocaleString('en-US', { month: 'long' });
            countsByMonth[monthName] = result.count;
        });
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Search data report fetched successfully', {
            countsByMonth,
            currentYear,
        });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.dataReport = dataReport;
//User Dashbaoard
const getUserDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const userId = req.user.userId;
        const username = req.user.firstName;
        const searches = yield activityLog_1.default.find({ entityType: 'Case', action: 'Search', userId: userId })
            .populate({
            path: 'entityId',
            model: cases_1.CaseModel,
            select: 'propertyTitle propertyLocation statusDispute registeredTitleNumber state caseId'
        })
            .select('entityId reference userId caseId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ITEMS_PER_PAGE_TEN)
            .lean()
            .exec();
        // Count total search
        const totalSearches = yield activityLog_1.default.countDocuments({ entityType: 'Case', action: 'Search', userId: userId });
        const totalProperties = yield cases_1.CaseModel.countDocuments({ isArchive: false });
        const totalLispendes = yield cases_1.CaseModel.countDocuments({ isArchive: false });
        // Send response with logs, total count, pagination info, total uploads, and total updates
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'User dashboard data fetched successfully', {
            searches,
            currentPage: page,
            totalPages: Math.ceil(totalSearches / ITEMS_PER_PAGE),
            totalSearches,
            totalProperties,
            totalLispendes,
            username
        });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getUserDashboard = getUserDashboard;
//User Search History
const getUserSearches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const userId = req.user.userId;
        const username = req.user.firstName;
        const searches = yield activityLog_1.default.find({ entityType: 'Case', action: 'Search', userId: userId })
            .populate({
            path: 'entityId',
            model: cases_1.CaseModel,
            select: 'propertyTitle propertyLocation statusDispute registeredTitleNumber state caseId'
        })
            .select('entityId reference userId caseId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ITEMS_PER_PAGE_TEN)
            .lean()
            .exec();
        // Count total search
        const totalSearches = yield activityLog_1.default.countDocuments({ entityType: 'Case', action: 'Search', userId: userId });
        const totalProperties = yield cases_1.CaseModel.countDocuments({ isArchive: false });
        // Send response with logs, total count, pagination info, total uploads, and total updates
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Searches data fetched successfully', {
            searches: searches.map(search => (Object.assign(Object.assign({}, search), { entityId: Object.assign(Object.assign({}, search.entityId), { userId: search.userId, caseId: search.caseId }) }))),
            currentPage: page,
            totalPages: Math.ceil(totalSearches / ITEMS_PER_PAGE_TEN),
            totalSearches,
            totalProperties,
            username
        });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getUserSearches = getUserSearches;
//Registrar Dashbaoard
const getRegistrarDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const userId = req.user.userId;
        console.log(userId);
        const cases = yield cases_1.CaseModel.find({ registrarId: userId, isFlagged: false, isArchive: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ITEMS_PER_PAGE)
            .lean();
        const totalSearches = yield activityLog_1.default.countDocuments({ entityType: 'Case', action: 'Search', registrarId: userId });
        const archivedCaseIds = yield cases_1.CaseModel.find({ isArchive: true }).distinct('_id');
        // Total pending
        const totalPending = yield cases_1.CaseModel.countDocuments({
            statusDispute: 'Pending',
            registrarId: userId,
            isArchive: false,
            isFlagged: false,
            'entityId': { $nin: archivedCaseIds }
        });
        //Total On appeal
        const totalAppeal = yield cases_1.CaseModel.countDocuments({
            statusDispute: 'On appeal',
            registrarId: userId,
            isArchive: false,
            isFlagged: false,
            'entityId': { $nin: archivedCaseIds }
        });
        //Total Disposed
        const totalDisposed = yield cases_1.CaseModel.countDocuments({
            statusDispute: 'Disposed',
            registrarId: userId,
            isArchive: false,
            isFlagged: false,
            'entityId': { $nin: archivedCaseIds }
        });
        // Send response with logs, total count, pagination info, total uploads, and total updates
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Registrar dashboard data fetched successfully', {
            cases,
            currentPage: page,
            totalPages: Math.ceil(totalSearches / ITEMS_PER_PAGE),
            totalSearches,
            totalPending,
            totalAppeal,
            totalDisposed,
        });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.getRegistrarDashboard = getRegistrarDashboard;
//Superadmin Dashbaoard Total Pending, On Appeal, Dismissed
const totalCasePending = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(currentYear - 1);
        const countsByMonth = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0
        };
        for (let i = 0; i < 12; i++) {
            const monthStart = new Date(currentYear, i, 1);
            const monthEnd = new Date(currentYear, i + 1, 0);
            const totalPending = yield cases_1.CaseModel.countDocuments({
                statusDispute: 'Pending',
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            const monthName = monthStart.toLocaleString('en-US', { month: 'long' });
            countsByMonth[monthName] = totalPending;
        }
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Total Pending cases count by month fetched successfully', {
            countsByMonth,
            currentYear
        });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.totalCasePending = totalCasePending;
const totalCaseOnappeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(currentYear - 1);
        const countsByMonth = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0
        };
        for (let i = 0; i < 12; i++) {
            const monthStart = new Date(currentYear, i, 1);
            const monthEnd = new Date(currentYear, i + 1, 0);
            const totalPending = yield cases_1.CaseModel.countDocuments({
                statusDispute: 'On appeal',
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            const monthName = monthStart.toLocaleString('en-US', { month: 'long' });
            countsByMonth[monthName] = totalPending;
        }
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Total cases On Appeal count by month fetched successfully', {
            countsByMonth,
            currentYear
        });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.totalCaseOnappeal = totalCaseOnappeal;
const totalCaseDisposed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(currentYear - 1);
        const countsByMonth = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0
        };
        for (let i = 0; i < 12; i++) {
            const monthStart = new Date(currentYear, i, 1);
            const monthEnd = new Date(currentYear, i + 1, 0);
            const totalPending = yield cases_1.CaseModel.countDocuments({
                statusDispute: 'Disposed',
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            const monthName = monthStart.toLocaleString('en-US', { month: 'long' });
            countsByMonth[monthName] = totalPending;
        }
        SuccessHandler_1.default.sendCustomSuccess(res, 200, 'Total cases Disposed count by month fetched successfully', {
            countsByMonth,
            currentYear
        });
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
exports.totalCaseDisposed = totalCaseDisposed;
