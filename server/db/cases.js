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
exports.CaseModel = exports.updateCaseById = exports.deleteCaseById = exports.createCase = exports.getCaseBySuitNumber = exports.getCaseById = exports.getCases = exports.statusDispute = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var statusDispute;
(function (statusDispute) {
    statusDispute["PENDING"] = "Pending";
    statusDispute["ONAPPEAL"] = "On appeal";
    statusDispute["DISPOSED"] = "Disposed";
})(statusDispute || (exports.statusDispute = statusDispute = {}));
const caseSchema = new mongoose_1.Schema({
    propertyTitle: { type: String, required: true },
    propertyOwner: { type: String, required: true },
    registeredTitleNumber: { type: String, required: true },
    plotStreetName: { type: String },
    state: { type: String },
    lga: { type: String },
    court: { type: String },
    city: { type: String },
    surveyPlanNumber: { type: String, required: true },
    nameParties: { type: String, required: true },
    suitNumber: { type: String, required: true },
    natureDispute: { type: String, required: true },
    courtDivision: { type: String, required: true },
    plotNumber: { type: String, required: true },
    statusDispute: { type: String, enum: Object.values(statusDispute), default: statusDispute.PENDING },
    dateCommencement: { type: Date },
    disposed: { type: String },
    userId: { type: String },
    registrarId: { type: String },
    isFlagged: { type: Boolean, default: false },
    isArchive: { type: Boolean, default: false },
}, { timestamps: true });
const caseModel = mongoose_1.default.model('Case', caseSchema);
const getCases = () => __awaiter(void 0, void 0, void 0, function* () { return caseModel.find().lean(); });
exports.getCases = getCases;
const getCaseById = (id) => caseModel.findById(id);
exports.getCaseById = getCaseById;
const getCaseBySuitNumber = (suitNumber) => caseModel.findOne({ suitNumber: { $regex: new RegExp(suitNumber, 'i') } });
exports.getCaseBySuitNumber = getCaseBySuitNumber;
const createCase = (values) => __awaiter(void 0, void 0, void 0, function* () {
    const caseValue = new caseModel(values);
    try {
        return yield caseValue.save();
    }
    catch (error) {
        throw new Error(`Failed to create case: ${error}`);
    }
});
exports.createCase = createCase;
const deleteCaseById = (id) => caseModel.findOneAndDelete({ _id: id });
exports.deleteCaseById = deleteCaseById;
const updateCaseById = (id, values) => caseModel.findByIdAndUpdate(id, values);
exports.updateCaseById = updateCaseById;
exports.default = caseModel;
exports.CaseModel = caseModel;
