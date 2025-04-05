"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const shared_1 = require("../shared");
const httpLogger = (options) => (req, res, next) => {
    const start = process.hrtime();
    next();
    const cleanup = () => {
        res.removeListener("end", logFn);
        res.removeListener("close", abortFn);
        res.removeListener("error", errorFn);
    };
    const logFn = () => {
        var _a;
        cleanup();
        const current_datetime = new Date();
        if (options === null || options === void 0 ? void 0 : options.timezone) {
            current_datetime.toLocaleString("en-US", {
                timeZone: options.timezone,
            });
        }
        const formatted_date = current_datetime.getFullYear() +
            "-" +
            (current_datetime.getMonth() + 1) +
            "-" +
            current_datetime.getDate() +
            " " +
            current_datetime.getHours() +
            ":" +
            current_datetime.getMinutes() +
            ":" +
            current_datetime.getSeconds();
        const method = req.method;
        const url = req.url;
        const requestedBy = (_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress;
        const status = res.statusCode;
        const durationInMilliseconds = (0, shared_1.getActualRequestDurationInMilliseconds)(start);
        const log = `${requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.replace(/^[^0-9]+/, "")} -> [${formatted_date}] %s${method}\x1b[0m: ${url} %s${status}\x1b[0m ${durationInMilliseconds.toLocaleString()} ms`;
        console.log(log, getColor(method), getColor(status));
    };
    const abortFn = () => {
        cleanup();
        console.warn("Request aborted by the client");
    };
    const errorFn = (err) => {
        cleanup();
        console.error(`Request pipeline error: ${err}`);
    };
    res.on("finish", logFn); // successful pipeline (regardless of its response)
    res.on("close", abortFn); // aborted pipeline
    res.on("error", errorFn);
};
exports.httpLogger = httpLogger;
const getColor = (method) => {
    if (method === "GET" || method.toString().match(/2\d\d/))
        return "\x1b[32m";
    else if (method === "POST" || method.toString().match(/3\d\d/))
        return "\x1b[33m";
    else if (method === "DELETE" || method.toString().match(/4\d\d/))
        return "\x1b[31m";
    else if (method === "PUT" || method.toString().match(/5\d\d/))
        return "\x1b[34m";
    else if (method === "PATCH")
        return "\x1b[37m";
    else
        return "\x1b[32m";
};
