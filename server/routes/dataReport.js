"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_controller_1 = require("../controllers/data.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.default = (router) => {
    //Super admin flagged case route
    router.get('/superadmin/data/totaluploadbyadmins', auth_middleware_1.authorize, auth_middleware_1.superadmin, data_controller_1.getTotalCaseUploadsByAdmins);
};
