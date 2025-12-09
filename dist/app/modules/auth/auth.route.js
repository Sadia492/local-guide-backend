"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_validate_1 = require("./auth.validate");
const fileUploader_1 = require("../../../utils/fileUploader");
const authRoute = (0, express_1.Router)();
authRoute.post("/register", fileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    req.body = auth_validate_1.authZodSchema.userCreateZodSchema.parse(JSON.parse(req.body.data));
    return (0, auth_controller_1.registerUser)(req, res, next);
});
authRoute.post("/login", auth_controller_1.loginUser);
authRoute.post("/logout", auth_controller_1.logoutUser);
exports.default = authRoute;
