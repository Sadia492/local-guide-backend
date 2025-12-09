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
exports.userService = void 0;
const bookings_model_1 = require("../bookings/bookings.model");
const listings_model_1 = __importDefault(require("../listings/listings.model"));
const reviews_model_1 = require("../reviews/reviews.model");
const users_interface_1 = require("./users.interface");
const users_model_1 = __importDefault(require("./users.model"));
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield users_model_1.default.findById(id);
});
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield users_model_1.default.find({ role: { $ne: "ADMIN" } });
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield users_model_1.default.findById(userId).select("-password");
    return {
        data: user,
    };
});
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield users_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    }).select("-password");
});
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield users_model_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === users_interface_1.Role.ADMIN) {
        throw new Error("Cannot delete admin user");
    }
    const result = yield users_model_1.default.findByIdAndDelete(userId);
    return result;
});
const changeUserRole = (userId, newRole) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield users_model_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === users_interface_1.Role.ADMIN && newRole !== users_interface_1.Role.ADMIN) {
        throw new Error("Cannot demote admin user");
    }
    if (newRole === users_interface_1.Role.GUIDE && user.role === users_interface_1.Role.TOURIST) {
        if (!user.expertise || user.expertise.length === 0) {
            user.expertise = ["General"];
        }
        if (!user.dailyRate) {
            user.dailyRate = 50;
        }
        user.travelPreferences = [];
    }
    if (newRole === users_interface_1.Role.TOURIST && user.role === users_interface_1.Role.GUIDE) {
        user.expertise = [];
        user.dailyRate = undefined;
        user.bio = user.bio || "";
    }
    user.role = newRole;
    const result = yield user.save();
    return result;
});
const toggleUserStatus = (userId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield users_model_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === users_interface_1.Role.ADMIN && !isActive) {
        throw new Error("Cannot deactivate admin user");
    }
    user.isActive = isActive;
    if (!isActive) {
        user.isVerified = false;
    }
    const result = yield user.save();
    return result;
});
const getUserProfileDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const user = yield users_model_1.default.findById(id).select("-password");
    if (!user) {
        throw new Error("User not found");
    }
    let profileData = {
        user: user.toObject(),
        listings: [],
        reviews: [],
        stats: {},
    };
    if (user.role === users_interface_1.Role.GUIDE) {
        const listings = (yield listings_model_1.default.find({
            guide: user._id,
            isActive: true,
        })
            .select("title city fee duration images description meetingPoint maxGroupSize")
            .sort({ createdAt: -1 })
            .limit(6));
        const listingIds = listings.map((listing) => listing._id);
        const guideReviews = (yield reviews_model_1.Review.find({
            listing: { $in: listingIds },
        })
            .populate({
            path: "user",
            select: "name profilePicture",
            model: users_model_1.default,
        })
            .populate({
            path: "listing",
            select: "title",
            model: listings_model_1.default,
        })
            .sort({ createdAt: -1 })
            .limit(10));
        const transformedReviews = guideReviews.map((review) => {
            var _a;
            const reviewObj = review.toObject();
            return {
                _id: reviewObj._id,
                rating: reviewObj.rating,
                comment: reviewObj.comment,
                createdAt: reviewObj.createdAt,
                user: reviewObj.user
                    ? {
                        name: reviewObj.user.name || "Traveler",
                        profilePicture: reviewObj.user.profilePicture || "",
                    }
                    : undefined,
                listingTitle: ((_a = reviewObj.listing) === null || _a === void 0 ? void 0 : _a.title) || "",
            };
        });
        const totalReviews = yield reviews_model_1.Review.countDocuments({
            listing: { $in: listingIds },
        });
        const averageRating = yield reviews_model_1.Review.aggregate([
            {
                $match: { listing: { $in: listingIds } },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        const completedBookings = yield bookings_model_1.Booking.countDocuments({
            listing: { $in: listingIds },
            status: "COMPLETED",
        });
        const totalBookings = yield bookings_model_1.Booking.countDocuments({
            listing: { $in: listingIds },
            status: { $in: ["CONFIRMED", "COMPLETED"] },
        });
        profileData.listings = listings;
        profileData.reviews = transformedReviews;
        profileData.stats = {
            totalReviews,
            averageRating: ((_a = averageRating[0]) === null || _a === void 0 ? void 0 : _a.averageRating) || 0,
            totalBookings,
            completedBookings,
            activeTours: listings.length,
        };
    }
    else if (user.role === users_interface_1.Role.TOURIST) {
        const touristReviews = (yield reviews_model_1.Review.find({
            user: user._id,
        })
            .populate({
            path: "listing",
            select: "title guide",
            populate: {
                path: "guide",
                select: "name profilePicture",
                model: users_model_1.default,
            },
        })
            .sort({ createdAt: -1 })
            .limit(10));
        const transformedReviews = touristReviews.map((review) => {
            const reviewObj = review.toObject();
            const listing = reviewObj.listing;
            return {
                _id: reviewObj._id,
                rating: reviewObj.rating,
                comment: reviewObj.comment,
                createdAt: reviewObj.createdAt,
                user: {
                    name: user.name,
                    profilePicture: user.profilePicture,
                },
                guide: (listing === null || listing === void 0 ? void 0 : listing.guide)
                    ? {
                        name: listing.guide.name || "Guide",
                        profilePicture: listing.guide.profilePicture || "",
                    }
                    : undefined,
                listingTitle: (listing === null || listing === void 0 ? void 0 : listing.title) || "",
            };
        });
        const touristBookings = yield bookings_model_1.Booking.countDocuments({
            user: user._id,
            status: { $in: ["COMPLETED", "CONFIRMED", "PENDING"] },
        });
        const completedTours = yield bookings_model_1.Booking.countDocuments({
            user: user._id,
            status: "COMPLETED",
        });
        const pendingTours = yield bookings_model_1.Booking.countDocuments({
            user: user._id,
            status: "PENDING",
        });
        const confirmedTours = yield bookings_model_1.Booking.countDocuments({
            user: user._id,
            status: "CONFIRMED",
        });
        const touristRatingStats = yield reviews_model_1.Review.aggregate([
            {
                $match: { user: user._id },
            },
            {
                $group: {
                    _id: null,
                    averageRatingGiven: { $avg: "$rating" },
                    totalReviewsWritten: { $sum: 1 },
                },
            },
        ]);
        profileData.reviews = transformedReviews;
        profileData.stats = {
            totalBookings: touristBookings,
            completedTours,
            pendingTours,
            confirmedTours,
            totalReviewsWritten: ((_b = touristRatingStats[0]) === null || _b === void 0 ? void 0 : _b.totalReviewsWritten) || 0,
            averageRatingGiven: ((_c = touristRatingStats[0]) === null || _c === void 0 ? void 0 : _c.averageRatingGiven) || 0,
        };
        profileData.listings = [];
    }
    else if (user.role === users_interface_1.Role.ADMIN) {
        profileData.stats = {
            role: "Administrator",
            isVerified: user.isVerified || false,
            isActive: user.isActive || false,
        };
    }
    return profileData;
});
exports.userService = {
    getMe,
    getSingleUser,
    updateUser,
    getAllUser,
    deleteUser,
    changeUserRole,
    toggleUserStatus,
    getUserProfileDetails,
};
