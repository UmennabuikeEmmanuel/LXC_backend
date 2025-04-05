"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUploadAccess = exports.checkDeleteAccess = exports.checkEditAccess = void 0;
// Middleware function to check for edit access
const checkEditAccess = (req, res, next) => {
    const userPermission = req.user.permission;
    if (userPermission.includes(userPermission.EDIT_ACCESS)) {
        return res.status(403).json({ message: 'Insufficient permissions for edit access' });
        next(); // User has edit access, proceed to the next middleware
    }
    else {
        return res.status(403).json({ message: 'Insufficient permissions for edit access' });
    }
};
exports.checkEditAccess = checkEditAccess;
// Middleware function to check for delete access
const checkDeleteAccess = (req, res, next) => {
    const userPermission = req.user.permission;
    if (userPermission.permissions.includes(userPermission.DELETE_ACCESS)) {
        next();
    }
    else {
        return res.status(403).json({ message: 'Insufficient permissions for delete access' });
    }
};
exports.checkDeleteAccess = checkDeleteAccess;
// Middleware function to check for upload access
const checkUploadAccess = (req, res, next) => {
    const userPermission = req.user.permission;
    if (userPermission.permissions.includes(userPermission.UPLOAD_ACCESS)) {
        next();
    }
    else {
        return res.status(403).json({ message: 'Insufficient permissions for upload access' });
    }
};
exports.checkUploadAccess = checkUploadAccess;
