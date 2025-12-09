"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authZodSchema = exports.userCreateZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const users_interface_1 = require("../users/users.interface");
exports.userCreateZodSchema = zod_1.default
    .object({
    name: zod_1.default
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name can't be more than 50 characters"),
    email: zod_1.default.string().email("Invalid email address"),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.default.enum([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE, users_interface_1.Role.TOURIST]).default(users_interface_1.Role.TOURIST),
    profilePicture: zod_1.default.string().url().optional(),
    bio: zod_1.default.string().max(500, "Bio can't exceed 500 characters").optional(),
    languages: zod_1.default.array(zod_1.default.string()).optional().default([]),
    expertise: zod_1.default.array(zod_1.default.string()).optional(),
    dailyRate: zod_1.default.number().min(0, "Daily rate cannot be negative").optional(),
    city: zod_1.default.string().optional(),
    travelPreferences: zod_1.default.array(zod_1.default.string()).optional().default([]),
})
    .refine((data) => {
    if (data.role === users_interface_1.Role.GUIDE) {
        if (!data.expertise || data.expertise.length === 0) {
            return false;
        }
        if (!data.dailyRate || data.dailyRate <= 0) {
            return false;
        }
        if (!data.city) {
            return false;
        }
    }
    return true;
}, {
    message: "Guides must provide expertise, dailyRate, and city",
    path: ["role"],
});
const userLoginZodSchema = zod_1.default.object({
    email: zod_1.default.email("Invalid email address"),
    password: zod_1.default.string().min(1, "Password is required"),
});
exports.authZodSchema = {
    userCreateZodSchema: exports.userCreateZodSchema,
    userLoginZodSchema,
};
