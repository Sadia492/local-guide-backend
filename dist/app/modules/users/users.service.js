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
    // Check if user exists
    const user = yield users_model_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    // Prevent admin from deleting themselves
    if (user.role === users_interface_1.Role.ADMIN) {
        throw new Error("Cannot delete admin user");
    }
    const result = yield users_model_1.default.findByIdAndDelete(userId);
    return result;
});
const changeUserRole = (userId, newRole) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const user = yield users_model_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    // Validate role transition
    if (user.role === users_interface_1.Role.ADMIN && newRole !== users_interface_1.Role.ADMIN) {
        throw new Error("Cannot demote admin user");
    }
    // If promoting to guide, ensure they have required fields
    if (newRole === users_interface_1.Role.GUIDE && user.role === users_interface_1.Role.TOURIST) {
        // Add default expertise if not present
        if (!user.expertise || user.expertise.length === 0) {
            user.expertise = ["General"];
        }
        // Set default daily rate if not present
        if (!user.dailyRate) {
            user.dailyRate = 50; // Default rate
        }
        // Clear tourist-specific fields
        user.travelPreferences = [];
    }
    // If demoting to tourist, clear guide-specific fields
    if (newRole === users_interface_1.Role.TOURIST && user.role === users_interface_1.Role.GUIDE) {
        user.expertise = [];
        user.dailyRate = undefined;
        user.bio = user.bio || ""; // Keep bio as it can be for tourists too
    }
    // Update the role
    user.role = newRole;
    const result = yield user.save();
    return result;
});
const toggleUserStatus = (userId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const user = yield users_model_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    // Prevent deactivating admin
    if (user.role === users_interface_1.Role.ADMIN && !isActive) {
        throw new Error("Cannot deactivate admin user");
    }
    // Prevent self-deactivation
    // This check should be done in controller with currentUser
    // if (currentUser._id.toString() === userId && !isActive) {
    //   throw new Error("Cannot deactivate your own account");
    // }
    // Update status
    user.isActive = isActive;
    // If deactivating, also set verified to false
    if (!isActive) {
        user.isVerified = false;
    }
    const result = yield user.save();
    return result;
});
// users.service.ts - Fixed version
// users.service.ts - Updated for role-specific responses
const getUserProfileDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Get basic user info
    const user = yield users_model_1.default.findById(id).select("-password");
    if (!user) {
        throw new Error("User not found");
    }
    // Role-specific data structure
    let profileData = {
        user: user.toObject(),
        listings: [],
        reviews: [],
        stats: {},
    };
    if (user.role === users_interface_1.Role.GUIDE) {
        // Guide-specific data
        // 1. Get guide's active listings
        const listings = (yield listings_model_1.default.find({
            guide: user._id,
            isActive: true,
        })
            .select("title city fee duration images description meetingPoint maxGroupSize")
            .sort({ createdAt: -1 })
            .limit(6));
        // 2. Get reviews for guide's listings
        const listingIds = listings.map((listing) => listing._id);
        // Get ALL reviews for this guide's listings
        const guideReviews = (yield reviews_model_1.Review.find({
            listing: { $in: listingIds },
        })
            .populate({
            path: "user",
            select: "name profilePicture",
            model: users_model_1.default, // Explicitly specify the model
        })
            .populate({
            path: "listing",
            select: "title",
            model: listings_model_1.default,
        })
            .sort({ createdAt: -1 })
            .limit(10));
        // 3. Transform reviews to ensure we have user names
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
                // Add listing info if needed
                listingTitle: ((_a = reviewObj.listing) === null || _a === void 0 ? void 0 : _a.title) || "",
            };
        });
        // 4. Get guide statistics
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
        profileData.reviews = transformedReviews; // Use transformed reviews
        profileData.stats = {
            totalReviews,
            averageRating: ((_a = averageRating[0]) === null || _a === void 0 ? void 0 : _a.averageRating) || 0,
            totalBookings,
            completedBookings,
            activeTours: listings.length,
        };
    }
    else if (user.role === users_interface_1.Role.TOURIST) {
        // Tourist-specific data
        // 1. Get reviews written by the tourist
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
        // 2. Transform reviews to ensure we have guide names
        const transformedReviews = touristReviews.map((review) => {
            const reviewObj = review.toObject();
            const listing = reviewObj.listing;
            return {
                _id: reviewObj._id,
                rating: reviewObj.rating,
                comment: reviewObj.comment,
                createdAt: reviewObj.createdAt,
                // The user who wrote the review (should be the tourist)
                user: {
                    name: user.name,
                    profilePicture: user.profilePicture,
                },
                // The guide who was reviewed
                guide: (listing === null || listing === void 0 ? void 0 : listing.guide)
                    ? {
                        name: listing.guide.name || "Guide",
                        profilePicture: listing.guide.profilePicture || "",
                    }
                    : undefined,
                listingTitle: (listing === null || listing === void 0 ? void 0 : listing.title) || "",
            };
        });
        // 3. Get tourist's booking stats
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
        // 4. Calculate average rating given by tourist
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
        profileData.reviews = transformedReviews; // Use transformed reviews
        profileData.stats = {
            totalBookings: touristBookings,
            completedTours,
            pendingTours,
            confirmedTours,
            totalReviewsWritten: ((_b = touristRatingStats[0]) === null || _b === void 0 ? void 0 : _b.totalReviewsWritten) || 0,
            averageRatingGiven: ((_c = touristRatingStats[0]) === null || _c === void 0 ? void 0 : _c.averageRatingGiven) || 0,
        };
        // NO listings for tourists
        profileData.listings = [];
    }
    else if (user.role === users_interface_1.Role.ADMIN) {
        // Admin-specific data
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
