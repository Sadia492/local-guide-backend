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
exports.reviewService = void 0;
const AppError_1 = __importDefault(require("../../../error/AppError"));
const bookings_interface_1 = require("../bookings/bookings.interface");
const bookings_model_1 = require("../bookings/bookings.model");
const listings_model_1 = __importDefault(require("../listings/listings.model"));
const reviews_model_1 = require("./reviews.model");
exports.reviewService = {
    createReview: (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { listing, rating, comment } = payload;
        // Check booking existence (only booked users can review)
        const hasBooking = yield bookings_model_1.Booking.findOne({
            user: userId,
            listing,
            status: bookings_interface_1.BookingStatus.COMPLETED,
        });
        if (!hasBooking) {
            throw new AppError_1.default(403, "You can only review listings you booked");
        }
        // Create review
        const review = yield reviews_model_1.Review.create({
            listing,
            user: userId,
            rating,
            comment,
        });
        // Update average rating
        const stats = yield reviews_model_1.Review.aggregate([
            { $match: { listing } },
            { $group: { _id: "$listing", avgRating: { $avg: "$rating" } } },
        ]);
        yield listings_model_1.default.findByIdAndUpdate(listing, {
            averageRating: ((_a = stats[0]) === null || _a === void 0 ? void 0 : _a.avgRating) || 0,
        });
        return review;
    }),
    getReviewsByUser: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const reviews = yield reviews_model_1.Review.find({ user: userId })
            .populate({
            path: "listing",
            select: "title city images fee duration guide",
            populate: {
                path: "guide",
                select: "name profilePicture",
            },
        })
            .sort({ createdAt: -1 });
        return reviews;
    }),
    getReviewsOfListing: (listingId) => __awaiter(void 0, void 0, void 0, function* () {
        return yield reviews_model_1.Review.find({ listing: listingId })
            .populate("user", "name profilePic")
            .sort({ createdAt: -1 });
    }),
    updateReview: (userId, reviewId, payload) => __awaiter(void 0, void 0, void 0, function* () {
        const review = yield reviews_model_1.Review.findOne({ _id: reviewId, user: userId });
        if (!review) {
            throw new AppError_1.default(403, "You are not allowed to edit this review");
        }
        Object.assign(review, payload);
        yield review.save();
        return review;
    }),
    deleteReview: (userId, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
        const review = yield reviews_model_1.Review.findOne({ _id: reviewId, user: userId });
        if (!review) {
            throw new AppError_1.default(403, "You are not allowed to delete this review");
        }
        yield review.deleteOne();
        return true;
    }),
};
