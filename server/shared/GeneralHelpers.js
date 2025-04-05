"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActualRequestDurationInMilliseconds = void 0;
const getActualRequestDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9; // convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};
exports.getActualRequestDurationInMilliseconds = getActualRequestDurationInMilliseconds;
