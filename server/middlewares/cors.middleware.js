"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCors = void 0;
const useCors = (options) => (req, res, next) => {
    var _a;
    res.header("Access-Control-Allow-Origin", (options === null || options === void 0 ? void 0 : options.origin) === "all" ? "*" : (_a = options === null || options === void 0 ? void 0 : options.origin) !== null && _a !== void 0 ? _a : "*");
    if (options === null || options === void 0 ? void 0 : options.credentials)
        res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
};
exports.useCors = useCors;
