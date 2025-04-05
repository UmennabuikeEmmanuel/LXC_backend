"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("../controllers/authentication");
exports.default = (router) => {
    router.post('/auth/register', authentication_1.register);
    router.post('/auth/business/register', authentication_1.businessRegister);
    router.get('/auth/verify/:token', authentication_1.verify);
    router.post('/auth/login', authentication_1.login);
    router.get('/auth/logout', authentication_1.logout);
    router.post('/auth/password/request', authentication_1.requestPasswordReset);
    router.post('/auth/password/reset', authentication_1.resetPassword);
};
