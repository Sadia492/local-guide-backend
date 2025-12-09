"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoute = void 0;
const express_1 = __importDefault(require("express"));
const reviews_controller_1 = require("./reviews.controller");
const reviews_validate_1 = require("./reviews.validate");
const auth_1 = require("../../../middleware/auth");
const validateRequest_1 = require("../../../middleware/validateRequest");
const users_interface_1 = require("../users/users.interface");
const router = express_1.default.Router();
router.post("/", (0, auth_1.auth)([users_interface_1.Role.TOURIST, users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN]), (0, validateRequest_1.validateRequest)(reviews_validate_1.reviewsZodSchema.createReviewZodSchema), reviews_controller_1.createReview);
router.get("/listing/:listingId", (0, auth_1.auth)([users_interface_1.Role.TOURIST, users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN]), reviews_controller_1.getListingReviews);
router.get("/user/:userId", (0, auth_1.auth)([users_interface_1.Role.TOURIST, users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN]), reviews_controller_1.getUserReviews);
router.patch("/:id", (0, auth_1.auth)([users_interface_1.Role.TOURIST, users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN]), (0, validateRequest_1.validateRequest)(reviews_validate_1.reviewsZodSchema.updateReviewZodSchema), reviews_controller_1.updateReview);
router.delete("/:id", (0, auth_1.auth)([users_interface_1.Role.TOURIST, users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN]), reviews_controller_1.deleteReview);
exports.reviewRoute = router;
