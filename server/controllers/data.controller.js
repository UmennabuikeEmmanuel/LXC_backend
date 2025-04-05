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
exports.getTotalCaseUploadsByAdmins = void 0;
const users_1 = __importDefault(require("../db/users"));
// Get total case uploads by registrars
const getTotalCaseUploadsByAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalCaseUploadsByRegistrars = yield users_1.default.aggregate([
            // Match users with role "registrar"
            {
                $match: { role: 'registrar' }
            },
            // Lookup cases by userId
            {
                $lookup: {
                    from: 'cases',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'cases'
                }
            },
            // Project user email and total case uploads
            {
                $project: {
                    email: '$email',
                    totalCaseUploads: { $size: '$cases' }
                }
            }
        ]);
        res.status(200).json({ success: true, data: totalCaseUploadsByRegistrars });
    }
    catch (error) {
        console.error('Error getting total case uploads by registrars:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.getTotalCaseUploadsByAdmins = getTotalCaseUploadsByAdmins;
