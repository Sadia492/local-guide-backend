"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingZodSchema = void 0;
const zod_1 = require("zod");
const createListingZodSchema = zod_1.z.object({
    title: zod_1.z.string().min(5),
    description: zod_1.z.string().min(20),
    itinerary: zod_1.z.string().optional(),
    city: zod_1.z.string().min(2),
    category: zod_1.z.enum(["Food", "Art", "Adventure", "History", "Photography"]),
    fee: zod_1.z.number().min(1),
    duration: zod_1.z.number().min(1),
    meetingPoint: zod_1.z.string().min(3),
    maxGroupSize: zod_1.z.number().min(1),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    language: zod_1.z.string().optional(),
});
const updateListingZodSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).optional(),
    description: zod_1.z.string().min(20).optional(),
    itinerary: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    category: zod_1.z
        .enum(["Food", "Art", "Adventure", "History", "Photography"])
        .optional(),
    fee: zod_1.z.number().optional(),
    duration: zod_1.z.number().optional(),
    meetingPoint: zod_1.z.string().optional(),
    maxGroupSize: zod_1.z.number().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    language: zod_1.z.string().optional(),
});
exports.listingZodSchema = {
    createListingZodSchema,
    updateListingZodSchema,
};
