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
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const users_interface_1 = require("../users/users.interface");
const users_model_1 = __importDefault(require("../users/users.model"));
const AppError_1 = __importDefault(require("../../../error/AppError"));
const env_1 = require("../../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fileUploader_1 = require("../../../utils/fileUploader");
const registerUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    if (req.file) {
        const uploadResult = yield fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        req.body.profilePicture = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    // Check if user exists
    const existingUser = yield users_model_1.default.findOne({ email: payload.email });
    if (existingUser) {
        throw new AppError_1.default(409, "User already exists");
    }
    // Role-specific validation in SERVICE (not Zod)
    if (payload.role === users_interface_1.Role.GUIDE) {
        if (!payload.expertise || payload.expertise.length === 0) {
            throw new AppError_1.default(400, "Expertise is required for guides");
        }
        if (!payload.dailyRate || payload.dailyRate <= 0) {
            throw new AppError_1.default(400, "Daily rate is required for guides");
        }
        if (!payload.city) {
            throw new AppError_1.default(400, "City is required for guides");
        }
    }
    // Remove guide fields for tourists
    if (payload.role === users_interface_1.Role.TOURIST) {
        delete payload.expertise;
        delete payload.dailyRate;
        delete payload.city;
    }
    payload.password = yield bcryptjs_1.default.hash(payload.password, 10);
    const user = yield users_model_1.default.create(payload);
    // Generate tokens for immediate login
    const jwtPayload = {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
    };
    // Access token
    const accessToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_ACCESS_SECRET, { expiresIn: env_1.envVars.JWT_ACCESS_EXPIRES });
    // Refresh token
    const refreshToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_REFRESH_SECRET, { expiresIn: env_1.envVars.JWT_REFRESH_EXPIRES });
    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio,
            languages: user.languages,
            expertise: user.expertise,
            dailyRate: user.dailyRate,
            travelPreferences: user.travelPreferences,
            profilePicture: user.profilePicture,
        },
        accessToken,
        refreshToken,
    };
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // 🔥 Must select password explicitly
    const isUserExist = yield users_model_1.default.findOne({ email: payload.email }).select("+password");
    if (!isUserExist) {
        throw new AppError_1.default(404, "User Not Found");
    }
    // Compare passwords
    const checkPassword = yield bcryptjs_1.default.compare(payload.password, isUserExist.password);
    if (!checkPassword) {
        throw new AppError_1.default(403, "Password not matched");
    }
    // JWT Payload
    const jwtPayload = {
        _id: isUserExist._id.toString(),
        email: isUserExist.email,
        role: isUserExist.role,
    };
    // Access token
    const accessToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_ACCESS_SECRET, { expiresIn: env_1.envVars.JWT_ACCESS_EXPIRES });
    // Refresh token
    const refreshToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_REFRESH_SECRET, { expiresIn: env_1.envVars.JWT_REFRESH_EXPIRES });
    return {
        accessToken,
        refreshToken,
    };
});
exports.authService = {
    registerUser,
    loginUser,
};
