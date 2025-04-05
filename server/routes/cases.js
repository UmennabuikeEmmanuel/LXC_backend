"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cases_1 = require("../controllers/cases");
const middlewares_1 = require("../middlewares");
const auth_middleware_1 = require("../middlewares/auth.middleware");
//import {checkEditAccess} from '../middlewares/permission.middleware';
exports.default = (router) => {
    //Superadin routes for cases with midleware auth
    router.get('/superadmin/cases/all', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.getAllCases);
    router.post('/superadmin/cases/new', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.addNewCase);
    router.put('/superadmin/cases/update/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.updateCase);
    router.delete('/superadmin/cases/delete/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.deleteCase);
    router.get('/superadmin/cases/search/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.getCaseById);
    router.post('/superadmin/cases/search/byvalues', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.getCaseByValues);
    router.post('/superadmin/cases/csvupload', auth_middleware_1.authorize, auth_middleware_1.superadmin, cases_1.uploadCasesCSV);
    router.get('/superadmin/cases/download/:id', cases_1.generateCertificate);
    //Court registrar routes
    router.post('/registrar/cases/new', auth_middleware_1.registrar, cases_1.addNewCase);
    router.get('/registrar/cases/all', auth_middleware_1.registrar, cases_1.getAllCasesRegistrar);
    router.put('/registrar/cases/update/:id', auth_middleware_1.registrar, cases_1.updateCase);
    router.put('/registrar/cases/update/status/:id', auth_middleware_1.registrar, auth_middleware_1.checkEditAccess, cases_1.updateCaseStatus);
    router.delete('/registrar/cases/delete/:id', auth_middleware_1.registrar, middlewares_1.isOwner, cases_1.deleteCase);
    router.get('/registrar/cases/search/:id', auth_middleware_1.registrar, cases_1.getCaseById);
    router.post('/registrar/cases/search/byvalues', auth_middleware_1.registrar, cases_1.getCaseByValues);
    router.post('/registrar/cases/csvupload', auth_middleware_1.registrar, cases_1.uploadCasesCSV);
    //Landing page
};
