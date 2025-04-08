"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initateDB = exports.db = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
try {
    mongoose_1.set('strictQuery', false);
    exports.db = mongoose_1.default.connection;
}
catch (error) {
    console.log("error db conn", error);
}
const initateDB = () => {
    try {
        const uri = process.env.DB_URI;
        if (uri) {
            mongoose_1.default.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                autoIndex: true,
            }, // Type assertion
            (error) => {
                if (error)
                    console.log("Mongo Error =>", error === null || error === void 0 ? void 0 : error.message);
            });
            exports.db.once("open", function () {
                console.log("Database connected successfully");
            });
        }
        else {
            console.log("Failed to get ENV variable: DB_URI");
        }
    }
    catch (error) {
        exports.db.on("error", () => console.log("error connecting to DB"));
    }
};
exports.initateDB = initateDB;
