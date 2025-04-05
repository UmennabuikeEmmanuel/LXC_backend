"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require('multer');
const users_1 = require("../controllers/users");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.default = (router) => {
    const upload = multer({ storage: multer.memoryStorage() });
    router.post('/superadmin/users/new', auth_middleware_1.authorize, auth_middleware_1.superadmin, users_1.addNewUser);
    router.get('/superadmin/users/all', auth_middleware_1.authorize, auth_middleware_1.superadmin, users_1.getAllUsers);
    router.delete('/superadmin/users/delete/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, users_1.deleteUser);
    router.get('/superadmin/user/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, users_1.getUser);
    router.patch('/superadmin/users/update/:id', auth_middleware_1.authorize, auth_middleware_1.superadmin, users_1.updateUser);
    router.get('/superadmin/registered-registrar', auth_middleware_1.authorize, auth_middleware_1.superadmin, users_1.registrarUsers);
};
