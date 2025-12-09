"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_interface_1 = require("./users.interface");
const auth_1 = require("../../../middleware/auth");
const users_controller_1 = require("./users.controller");
const validateRequest_1 = require("../../../middleware/validateRequest");
const users_validate_1 = require("./users.validate");
const userRoute = (0, express_1.Router)();
userRoute.get("/me", (0, auth_1.auth)([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE, users_interface_1.Role.TOURIST]), users_controller_1.getMe);
userRoute.get("/all", (0, auth_1.auth)([users_interface_1.Role.ADMIN]), users_controller_1.getAllUser);
userRoute.get("/profile-details/:id", (0, auth_1.auth)([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE, users_interface_1.Role.TOURIST]), users_controller_1.getUserProfileDetails);
userRoute.get("/:id", users_controller_1.getSingleUser);
userRoute.patch("/:id", (0, auth_1.auth)([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE, users_interface_1.Role.TOURIST]), (0, validateRequest_1.validateRequest)(users_validate_1.userZodSchema.updateUserZodSchema), users_controller_1.updateUser);
userRoute.delete("/:id", (0, auth_1.auth)([users_interface_1.Role.ADMIN]), users_controller_1.deleteUser); // NEW
userRoute.patch("/:id/role", (0, auth_1.auth)([users_interface_1.Role.ADMIN]), users_controller_1.changeUserRole); // NEW
userRoute.patch("/:id/status", (0, auth_1.auth)([users_interface_1.Role.ADMIN]), users_controller_1.toggleUserStatus); // NEW
exports.default = userRoute;
