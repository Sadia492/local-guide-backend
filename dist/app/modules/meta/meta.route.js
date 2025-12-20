"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_interface_1 = require("../users/users.interface");
const auth_1 = require("../../../middleware/auth");
const meta_controller_1 = require("./meta.controller");
const metaRoute = express_1.default.Router();
metaRoute.get("/dashboard", (0, auth_1.auth)([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE, users_interface_1.Role.TOURIST]), meta_controller_1.MetaController.getDashboardStats);
metaRoute.get("/dashboard/admin", (0, auth_1.auth)([users_interface_1.Role.ADMIN]), meta_controller_1.MetaController.getAdminDashboardStats);
metaRoute.get("/charts", (0, auth_1.auth)([users_interface_1.Role.ADMIN]), meta_controller_1.MetaController.getChartData);
exports.default = metaRoute;
