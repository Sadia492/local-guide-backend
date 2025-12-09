"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfileDetails = exports.toggleUserStatus = exports.changeUserRole = exports.deleteUser = exports.getAllUser = exports.updateUser = exports.getSingleUser = exports.getMe = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const users_service_1 = require("./users.service");
const users_interface_1 = require("./users.interface");
const getSingleUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield users_service_1.userService.getSingleUser(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
}));
exports.getSingleUser = getSingleUser;
const getAllUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield users_service_1.userService.getAllUser();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
}));
exports.getAllUser = getAllUser;
const getMe = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Your profile Retrieved Successfully",
        data: user,
    });
}));
exports.getMe = getMe;
const updateUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (req.user.role !== users_interface_1.Role.ADMIN && req.user._id.toString() !== userId) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "You are not allowed to update this profile",
            data: null,
        });
    }
    const result = yield users_service_1.userService.updateUser(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User updated successfully",
        data: result,
    });
}));
exports.updateUser = updateUser;
const deleteUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (req.user.role !== users_interface_1.Role.ADMIN) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "Only admins can delete users",
            data: null,
        });
    }
    const result = yield users_service_1.userService.deleteUser(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User deleted successfully",
        data: result,
    });
}));
exports.deleteUser = deleteUser;
const changeUserRole = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { role } = req.body;
    if (req.user.role !== users_interface_1.Role.ADMIN) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "Only admins can change user roles",
            data: null,
        });
    }
    const result = yield users_service_1.userService.changeUserRole(userId, role);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `User role changed to ${role} successfully`,
        data: result,
    });
}));
exports.changeUserRole = changeUserRole;
const toggleUserStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { isActive } = req.body;
    if (req.user.role !== users_interface_1.Role.ADMIN) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "Only admins can change user status",
            data: null,
        });
    }
    if (typeof isActive !== "boolean") {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "isActive must be a boolean value",
            data: null,
        });
    }
    const result = yield users_service_1.userService.toggleUserStatus(userId, isActive);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        data: result,
    });
}));
exports.toggleUserStatus = toggleUserStatus;
const getUserProfileDetails = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const profileData = yield users_service_1.userService.getUserProfileDetails(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "User profile details retrieved successfully",
        data: profileData,
    });
}));
exports.getUserProfileDetails = getUserProfileDetails;
