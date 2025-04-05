"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_controller_1 = require("../controllers/payment.controller");
exports.default = (router) => {
    //Guest user from landing page routes
    router.post('/payment/process/search_and_download', payment_controller_1.searchAndDownload);
    router.post('/payment/process', payment_controller_1.processPayment);
    router.get('/download/:userId/:reference', payment_controller_1.downloadCertificate);
    router.get('/payment/send/:userId/:reference', payment_controller_1.sendCertificate);
    router.post('/payment/process/search', payment_controller_1.processSearchPayment);
};
