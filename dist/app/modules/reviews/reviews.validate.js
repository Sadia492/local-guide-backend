"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsZodSchema = exports.updateReviewZodSchema = exports.createReviewZodSchema = void 0;
const zod_1 = require("zod");
exports.createReviewZodSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().max(500).optional(),
    listing: zod_1.z.string(),
});
exports.updateReviewZodSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1).max(5).optional(),
    comment: zod_1.z.string().max(500).optional(),
});
exports.reviewsZodSchema = {
    createReviewZodSchema: exports.createReviewZodSchema,
    updateReviewZodSchema: exports.updateReviewZodSchema,
};
