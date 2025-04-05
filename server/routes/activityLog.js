"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const activity_controller_1 = require("../controllers/activity.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.default = (router) => {
    //Super admin activity log
    router.get('/superadmin/activitylogs', auth_middleware_1.authorize, auth_middleware_1.superadmin, activity_controller_1.getAllActivities);
    router.get('/superadmin/activitydetails/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, activity_controller_1.getActivityDetails);
    router.delete('/superadmin/activitylogs/delete/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, activity_controller_1.deleteLog);
    router.get('/superadmin/newactivitylogs', auth_middleware_1.authorize, auth_middleware_1.superadmin, activity_controller_1.getAllNewActivities);
    //Court registrar activity log
    router.get('/registrar/activitylogs', auth_middleware_1.authorize, auth_middleware_1.registrar, activity_controller_1.getAllCourtActivities);
    router.get('/registrar/activitydetails/:id', auth_middleware_1.authorize, auth_middleware_1.registrar, activity_controller_1.getActivityDetails);
    router.delete('/registrar/activitylogs/delete/:id', auth_middleware_1.authorize, auth_middleware_1.registrar, activity_controller_1.deleteLog);
};
