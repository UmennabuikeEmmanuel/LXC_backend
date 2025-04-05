"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../controllers/settings");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.default = (router) => {
    //Superadmin
    router.get('/superadmin/settings', auth_middleware_1.authorize, auth_middleware_1.superadmin, settings_1.getSettingsUser);
    router.put('/superadmin/settings', auth_middleware_1.authorize, auth_middleware_1.superadmin, settings_1.updateSettingsUser);
    router.post('/superadmin/generate/otp', auth_middleware_1.authorize, auth_middleware_1.superadmin, settings_1.generateOtp);
    //Registrar
    router.get('/registrar/settings', auth_middleware_1.authorize, auth_middleware_1.registrar, settings_1.getSettingsRegistrar);
    router.put('/registrar/settings', auth_middleware_1.authorize, auth_middleware_1.registrar, settings_1.updateSettingsRegistrar);
    //User
    router.get('/user/settings', auth_middleware_1.authorize, auth_middleware_1.user, settings_1.getSettingsUser);
    router.put('/user/settings', auth_middleware_1.authorize, auth_middleware_1.user, settings_1.updateSettingsUser);
    router.post('/user/generate/otp', auth_middleware_1.authorize, auth_middleware_1.user, settings_1.generateOtp);
};
