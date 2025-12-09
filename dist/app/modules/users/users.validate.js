"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userZodSchema = void 0;
const zod_1 = require("zod");
const updateUserZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(255).optional(),
    profilePic: zod_1.z.string().url().optional(),
    bio: zod_1.z.string().max(500).optional(),
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    // Guide specific
    expertise: zod_1.z.array(zod_1.z.string()).optional(),
    dailyRate: zod_1.z.number().optional(),
    // Tourist specific
    preferences: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.userZodSchema = {
    updateUserZodSchema,
};
