"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const router = (0, express_1.Router)();
// User registration route
router.post("/register", users_controller_1.registerUser);
// User login route
router.post("/login", users_controller_1.loginUser);
exports.default = router;
