"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.default = (router) => {
    //Super admin dashboard routes
    router.get('/superadmin/dashboard/users', auth_middleware_1.authorize, auth_middleware_1.superadmin, dashboard_controller_1.getUsers);
    router.get('/superadmin/dashboard/activitylog', auth_middleware_1.authorize, auth_middleware_1.superadmin, dashboard_controller_1.getActivities);
    router.get('/superadmin/dashboard/datareport', auth_middleware_1.authorize, auth_middleware_1.superadmin, dashboard_controller_1.dataReport);
    router.get('/superadmin/dashboard/totalpending', auth_middleware_1.authorize, auth_middleware_1.superadmin, dashboard_controller_1.totalCasePending);
    router.get('/superadmin/dashboard/totalonappeal', auth_middleware_1.authorize, auth_middleware_1.superadmin, dashboard_controller_1.totalCaseOnappeal);
    router.get('/superadmin/dashboard/totaldisposed', auth_middleware_1.authorize, auth_middleware_1.superadmin, dashboard_controller_1.totalCaseDisposed);
    router.get('/superadmin/dashboard/totalsearches', auth_middleware_1.authorize, auth_middleware_1.superadmin, dashboard_controller_1.dataReport);
    //User Dashbaoard
    router.get('/user/dashboard', auth_middleware_1.authorize, auth_middleware_1.user, dashboard_controller_1.getUserDashboard);
    router.get('/user/searches', auth_middleware_1.authorize, auth_middleware_1.user, dashboard_controller_1.getUserSearches);
    //Court admin Dashoard
    router.get('/registrar/dashboard', auth_middleware_1.authorize, auth_middleware_1.registrar, dashboard_controller_1.getRegistrarDashboard);
};
