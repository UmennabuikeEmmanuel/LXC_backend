"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cases_1 = require("../controllers/cases");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.default = (router) => {
    //Super admin flagged case route
    router.get('/superadmin/cases/flag/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.flagCase);
    router.delete('/superadmin/cases/flag/remove/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.unflagCase);
    router.get('/superadmin/cases/flags', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.getFlaggedCases);
    router.get('/superadmin/cases/flag/download/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.downloadFlaggedCasesAsPDF);
    //Court registrar flagged case route
    router.get('/registrar/cases/flag/:id', auth_middleware_1.authorize, auth_middleware_1.registrar, cases_1.flagCase);
    router.delete('/registrar/cases/flag/remove/:id', auth_middleware_1.authorize, auth_middleware_1.registrar, cases_1.unflagCase);
    router.get('/registrar/cases/flags', auth_middleware_1.authorize, auth_middleware_1.registrar, cases_1.getFlaggedCases);
};
