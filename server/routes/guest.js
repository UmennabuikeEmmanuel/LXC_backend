"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cases_1 = require("../controllers/cases");
exports.default = (router) => {
    //Landing page routes
    router.post('/search/byValues', cases_1.searchByValues);
};
