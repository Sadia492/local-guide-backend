// import { IUser, Role } from "@/models/users/users.interface";
// import User from "@/models/users/users.model";
// import Booking from "@/models/bookings/bookings.model";
// import Listing from "@/models/listings/listings.model";
// import Review from "@/models/reviews/reviews.model";

import { Booking } from "../bookings/bookings.model";
import Listing from "../listings/listings.model";
import { Review } from "../reviews/reviews.model";
import { IUser, Role } from "../users/users.interface";
import User from "../users/users.model";

export interface DashboardStats {
  totalListings?: number;
  totalBookings?: number;
  totalUsers?: number;
  totalGuides?: number;
  totalTourists?: number;
  totalRevenue?: number;
  pendingBookings?: number;
  confirmedBookings?: number;
  completedBookings?: number;
  activeListings?: number;
  averageRating?: number;
  totalReviews?: number;
  recentBookings?: any[];
  recentReviews?: any[];
  upcomingBookings?: any[];
  favoriteListings?: any[];
}

const fetchDashboardMetaData = async (user: IUser): Promise<DashboardStats> => {
  let metaData: DashboardStats;

  switch (user?.role) {
    case Role.ADMIN:
      metaData = await getAdminMetaData();
      break;
    case Role.GUIDE:
      metaData = await getGuideMetaData(user);
      break;
    case Role.TOURIST:
      metaData = await getTouristMetaData(user);
      break;
    default:
      throw new Error("Invalid user role!");
  }

  return metaData;
};

// ADMIN Dashboard Stats
const getAdminMetaData = async (): Promise<DashboardStats> => {
  // Get counts
  const [
    totalListings,
    activeListings,
    totalBookings,
    pendingBookings,
    totalUsers,
    totalGuides,
    totalTourists,
    totalRevenueResult,
    recentBookings,
    recentReviews,
  ] = await Promise.all([
    // Total listings
    Listing.countDocuments(),

    // Active listings
    Listing.countDocuments({ isActive: true }),

    // Total bookings
    Booking.countDocuments(),

    // Pending bookings
    Booking.countDocuments({ status: "PENDING" }),

    // Total users (excluding admins)
    User.countDocuments({ role: { $ne: Role.ADMIN } }),

    // Total guides
    User.countDocuments({ role: Role.GUIDE }),

    // Total tourists
    User.countDocuments({ role: Role.TOURIST }),

    // Total revenue from completed bookings
    Booking.aggregate([
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

    // Recent bookings (last 10)
    Booking.find()
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

    // Recent reviews (last 10)
    Review.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name profilePicture")
      .populate("listing", "title")
      .lean(),
  ]);

  // Calculate average rating
  const averageRatingResult = await Review.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
  const averageRating = averageRatingResult[0]?.averageRating || 0;

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
};

// GUIDE Dashboard Stats
const getGuideMetaData = async (user: IUser): Promise<DashboardStats> => {
  const guideId = (user as any)?._id as string;

  // Get guide's listings
  const guideListings = await Listing.find({ guide: guideId }).select("_id");
  const listingIds = guideListings.map((listing) => listing._id);

  // Get all counts and data in parallel
  const [
    totalListings,
    activeListings,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenueResult,
    averageRatingResult,
    recentBookings,
    recentReviews,
    upcomingBookings,
  ] = await Promise.all([
    // Total listings
    Listing.countDocuments({ guide: guideId }),

    // Active listings
    Listing.countDocuments({ guide: guideId, isActive: true }),

    // Total bookings for guide's listings
    Booking.countDocuments({ listing: { $in: listingIds } }),

    // Pending bookings
    Booking.countDocuments({
      listing: { $in: listingIds },
      status: "PENDING",
    }),

    // Completed bookings
    Booking.countDocuments({
      listing: { $in: listingIds },
      status: "COMPLETED",
    }),

    // Total revenue
    Booking.aggregate([
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

    // Average rating for guide's listings
    Review.aggregate([
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

    // Recent bookings (last 10)
    Booking.find({ listing: { $in: listingIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .populate("listing", "title")
      .lean(),

    // Recent reviews (last 10)
    Review.find({ listing: { $in: listingIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name profilePicture")
      .populate("listing", "title")
      .lean(),

    // Upcoming bookings (next 7 days)
    Booking.find({
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

  const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
  const averageRating = averageRatingResult[0]?.averageRating || 0;

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
};

// TOURIST Dashboard Stats
const getTouristMetaData = async (user: IUser): Promise<DashboardStats> => {
  const touristId = (user as any)._id as string;

  // Get all counts and data in parallel
  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalReviews,
    recentBookings,
    upcomingBookings,
    favoriteListings,
  ] = await Promise.all([
    // Total bookings
    Booking.countDocuments({ user: touristId }),

    // Pending bookings
    Booking.countDocuments({
      user: touristId,
      status: "PENDING",
    }),

    // Confirmed bookings
    Booking.countDocuments({
      user: touristId,
      status: "CONFIRMED",
    }),

    // Completed bookings
    Booking.countDocuments({
      user: touristId,
      status: "COMPLETED",
    }),

    // Total reviews written
    Review.countDocuments({ user: touristId }),

    // Recent bookings (last 10)
    Booking.find({ user: touristId })
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

    // Upcoming bookings (next 7 days)
    Booking.find({
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

    // Get listings the tourist has booked multiple times (favorites)
    Booking.aggregate([
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

  // Calculate total spent
  const totalSpentResult = await Booking.aggregate([
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

  const totalSpent = totalSpentResult[0]?.totalSpent || 0;

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
};

// Get bar chart data for admin dashboard
const getBarChartData = async (timeframe: "monthly" | "weekly" = "monthly") => {
  if (timeframe === "monthly") {
    return await Booking.aggregate([
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
  } else {
    // Weekly data
    return await Booking.aggregate([
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
};

// Get pie chart data for admin dashboard
const getPieChartData = async () => {
  const [bookingStatus, listingCategories, userRoles] = await Promise.all([
    // Booking status distribution
    Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    // Listing categories distribution
    Listing.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]),

    // User roles distribution (excluding admin)
    User.aggregate([
      {
        $match: { role: { $ne: Role.ADMIN } },
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
};

export const MetaService = {
  fetchDashboardMetaData,
  getAdminMetaData,
  getGuideMetaData,
  getTouristMetaData,
  getBarChartData,
  getPieChartData,
};
