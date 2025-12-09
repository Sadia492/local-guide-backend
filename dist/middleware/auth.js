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
exports.auth = void 0;
const AppError_1 = __importDefault(require("../error/AppError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../app/config/env");
const users_model_1 = __importDefault(require("../app/modules/users/users.model"));
const auth = (roles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    if (!token)
        throw new AppError_1.default(401, "Authentication token not found in cookies");
    const isVerified = jsonwebtoken_1.default.verify(token, env_1.envVars.JWT_ACCESS_SECRET);
    const isUserExist = yield users_model_1.default.findOne({ email: isVerified.email });
    if (!isUserExist)
        throw new AppError_1.default(404, "User Not Found");
    if (!roles.includes(isVerified.role)) {
        throw new AppError_1.default(403, "Forbidden: You don't have access to this resource");
    }
    req.user = isUserExist;
    next();
});
exports.auth = auth;
