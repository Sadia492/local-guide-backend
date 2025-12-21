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
exports.MetaService = void 0;
const bookings_model_1 = require("../bookings/bookings.model");
const listings_model_1 = __importDefault(require("../listings/listings.model"));
const reviews_model_1 = require("../reviews/reviews.model");
const users_interface_1 = require("../users/users.interface");
const users_model_1 = __importDefault(require("../users/users.model"));
const fetchDashboardMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    let metaData;
    switch (user === null || user === void 0 ? void 0 : user.role) {
        case users_interface_1.Role.ADMIN:
            metaData = yield getAdminMetaData();
            break;
        case users_interface_1.Role.GUIDE:
            metaData = yield getGuideMetaData(user);
            break;
        case users_interface_1.Role.TOURIST:
            metaData = yield getTouristMetaData(user);
            break;
        default:
            throw new Error("Invalid user role!");
    }
    return metaData;
});
const getAdminMetaData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [totalListings, activeListings, totalBookings, pendingBookings, totalUsers, totalGuides, totalTourists, totalRevenueResult, recentBookings, recentReviews,] = yield Promise.all([
        listings_model_1.default.countDocuments(),
        listings_model_1.default.countDocuments({ isActive: true }),
        bookings_model_1.Booking.countDocuments(),
        bookings_model_1.Booking.countDocuments({ status: "PENDING" }),
        users_model_1.default.countDocuments({ role: { $ne: users_interface_1.Role.ADMIN } }),
        users_model_1.default.countDocuments({ role: users_interface_1.Role.GUIDE }),
        users_model_1.default.countDocuments({ role: users_interface_1.Role.TOURIST }),
        bookings_model_1.Booking.aggregate([
            {
                $match: {
                    status: "COMPLETED",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
        ]),
        bookings_model_1.Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name email")
            .populate("listing", "title guide")
            .populate({
            path: "listing",
            populate: {
                path: "guide",
                select: "name",
            },
        })
            .lean(),
        reviews_model_1.Review.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name profilePicture")
            .populate("listing", "title")
            .lean(),
    ]);
    const averageRatingResult = yield reviews_model_1.Review.aggregate([
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
            },
        },
    ]);
    const totalRevenue = ((_a = totalRevenueResult[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
    const averageRating = ((_b = averageRatingResult[0]) === null || _b === void 0 ? void 0 : _b.averageRating) || 0;
    return {
        totalListings,
        activeListings,
        totalBookings,
        pendingBookings,
        totalUsers,
        totalGuides,
        totalTourists,
        totalRevenue,
        averageRating: parseFloat(averageRating.toFixed(1)),
        recentBookings,
        recentReviews,
    };
});
const getHeroStats = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalTravelersResult, totalLocalGuidesResult, totalCitiesResult, reviewStatsResult,] = yield Promise.all([
            bookings_model_1.Booking.distinct("user", {
                status: { $in: ["CONFIRMED", "COMPLETED"] },
            }).then((bookingUserIds) => {
                return users_model_1.default.countDocuments({
                    _id: { $in: bookingUserIds },
                    role: users_interface_1.Role.TOURIST,
                    isActive: true,
                });
            }),
            listings_model_1.default.distinct("guide", { isActive: true }).then((activeGuideIds) => {
                return users_model_1.default.countDocuments({
                    _id: { $in: activeGuideIds },
                    role: users_interface_1.Role.GUIDE,
                    isActive: true,
                });
            }),
            listings_model_1.default.distinct("city", { isActive: true }).then((cities) => {
                const validCities = cities.filter((city) => city && city.trim() !== "");
                return validCities.length;
            }),
            reviews_model_1.Review.aggregate([
                {
                    $group: {
                        _id: null,
                        totalReviews: { $sum: 1 },
                        fiveStarReviews: {
                            $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
                        },
                    },
                },
                {
                    $project: {
                        totalReviews: 1,
                        fiveStarReviews: 1,
                        fiveStarPercentage: {
                            $cond: [
                                { $gt: ["$totalReviews", 0] },
                                {
                                    $multiply: [
                                        { $divide: ["$fiveStarReviews", "$totalReviews"] },
                                        100,
                                    ],
                                },
                                0,
                            ],
                        },
                    },
                },
            ]),
        ]);
        const formatNumber = (num) => {
            if (num >= 1000) {
                return `${Math.floor(num / 1000)}K+`;
            }
            return `${num}+`;
        };
        const reviewStats = reviewStatsResult[0] || { fiveStarPercentage: 0 };
        const fiveStarPercentage = reviewStats.fiveStarPercentage
            ? Math.round(reviewStats.fiveStarPercentage)
            : 0;
        return {
            happyTravelers: formatNumber(totalTravelersResult || 0),
            localGuides: formatNumber(totalLocalGuidesResult || 0),
            cities: formatNumber(totalCitiesResult || 0),
            fiveStarReviews: fiveStarPercentage || 98,
        };
    }
    catch (error) {
        console.error("Error fetching hero stats:", error);
        return {
            happyTravelers: "50K+",
            localGuides: "2K+",
            cities: "500+",
            fiveStarReviews: 98,
        };
    }
});
const getGuideMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const guideId = user === null || user === void 0 ? void 0 : user._id;
    const guideListings = yield listings_model_1.default.find({ guide: guideId }).select("_id");
    const listingIds = guideListings.map((listing) => listing._id);
    const [totalListings, activeListings, totalBookings, pendingBookings, completedBookings, totalRevenueResult, averageRatingResult, recentBookings, recentReviews, upcomingBookings,] = yield Promise.all([
        listings_model_1.default.countDocuments({ guide: guideId }),
        listings_model_1.default.countDocuments({ guide: guideId, isActive: true }),
        bookings_model_1.Booking.countDocuments({ listing: { $in: listingIds } }),
        bookings_model_1.Booking.countDocuments({
            listing: { $in: listingIds },
            status: "PENDING",
        }),
        bookings_model_1.Booking.countDocuments({
            listing: { $in: listingIds },
            status: "COMPLETED",
        }),
        bookings_model_1.Booking.aggregate([
            {
                $match: {
                    listing: { $in: listingIds },
                    status: "COMPLETED",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
        ]),
        reviews_model_1.Review.aggregate([
            {
                $match: {
                    listing: { $in: listingIds },
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                },
            },
        ]),
        bookings_model_1.Booking.find({ listing: { $in: listingIds } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name email")
            .populate("listing", "title")
            .lean(),
        reviews_model_1.Review.find({ listing: { $in: listingIds } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name profilePicture")
            .populate("listing", "title")
            .lean(),
        bookings_model_1.Booking.find({
            listing: { $in: listingIds },
            status: "CONFIRMED",
            startDate: { $gte: new Date() },
        })
            .sort({ startDate: 1 })
            .limit(5)
            .populate("user", "name email")
            .populate("listing", "title")
            .lean(),
    ]);
    const totalRevenue = ((_a = totalRevenueResult[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
    const averageRating = ((_b = averageRatingResult[0]) === null || _b === void 0 ? void 0 : _b.averageRating) || 0;
    return {
        totalListings,
        activeListings,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue,
        averageRating: parseFloat(averageRating.toFixed(1)),
        recentBookings,
        recentReviews,
        upcomingBookings,
    };
});
const getTouristMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const touristId = user._id;
    const [totalBookings, pendingBookings, confirmedBookings, completedBookings, totalReviews, recentBookings, upcomingBookings, favoriteListings,] = yield Promise.all([
        bookings_model_1.Booking.countDocuments({ user: touristId }),
        bookings_model_1.Booking.countDocuments({
            user: touristId,
            status: "PENDING",
        }),
        bookings_model_1.Booking.countDocuments({
            user: touristId,
            status: "CONFIRMED",
        }),
        bookings_model_1.Booking.countDocuments({
            user: touristId,
            status: "COMPLETED",
        }),
        reviews_model_1.Review.countDocuments({ user: touristId }),
        bookings_model_1.Booking.find({ user: touristId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("listing", "title guide images fee")
            .populate({
            path: "listing",
            populate: {
                path: "guide",
                select: "name profilePicture",
            },
        })
            .lean(),
        bookings_model_1.Booking.find({
            user: touristId,
            status: "CONFIRMED",
            startDate: { $gte: new Date() },
        })
            .sort({ startDate: 1 })
            .limit(5)
            .populate("listing", "title guide images")
            .populate({
            path: "listing",
            populate: {
                path: "guide",
                select: "name profilePicture",
            },
        })
            .lean(),
        bookings_model_1.Booking.aggregate([
            {
                $match: { user: touristId },
            },
            {
                $group: {
                    _id: "$listing",
                    bookingCount: { $sum: 1 },
                },
            },
            {
                $sort: { bookingCount: -1 },
            },
            {
                $limit: 5,
            },
            {
                $lookup: {
                    from: "listings",
                    localField: "_id",
                    foreignField: "_id",
                    as: "listingDetails",
                },
            },
            {
                $unwind: "$listingDetails",
            },
            {
                $project: {
                    listing: "$listingDetails",
                    bookingCount: 1,
                },
            },
        ]),
    ]);
    const totalSpentResult = yield bookings_model_1.Booking.aggregate([
        {
            $match: {
                user: touristId,
                status: "COMPLETED",
            },
        },
        {
            $group: {
                _id: null,
                totalSpent: { $sum: "$totalAmount" },
            },
        },
    ]);
    const totalSpent = ((_a = totalSpentResult[0]) === null || _a === void 0 ? void 0 : _a.totalSpent) || 0;
    return {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalReviews,
        totalRevenue: totalSpent,
        recentBookings,
        upcomingBookings,
        favoriteListings: favoriteListings || [],
    };
});
const getBarChartData = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (timeframe = "monthly") {
    if (timeframe === "monthly") {
        return yield bookings_model_1.Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
            {
                $project: {
                    month: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                },
                            },
                        },
                    },
                    count: 1,
                    revenue: 1,
                },
            },
        ]);
    }
    else {
        return yield bookings_model_1.Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        week: { $week: "$createdAt" },
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.week": 1 },
            },
            {
                $project: {
                    week: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-W",
                            { $toString: "$_id.week" },
                        ],
                    },
                    count: 1,
                    revenue: 1,
                },
            },
        ]);
    }
});
const getPieChartData = () => __awaiter(void 0, void 0, void 0, function* () {
    const [bookingStatus, listingCategories, userRoles] = yield Promise.all([
        bookings_model_1.Booking.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]),
        listings_model_1.default.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                },
            },
        ]),
        users_model_1.default.aggregate([
            {
                $match: { role: { $ne: users_interface_1.Role.ADMIN } },
            },
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);
    return {
        bookingStatus,
        listingCategories,
        userRoles,
    };
});
exports.MetaService = {
    fetchDashboardMetaData,
    getAdminMetaData,
    getGuideMetaData,
    getTouristMetaData,
    getBarChartData,
    getPieChartData,
    getHeroStats,
};
