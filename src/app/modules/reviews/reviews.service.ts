import AppError from "../../../error/AppError";
import { BookingStatus } from "../bookings/bookings.interface";
import { Booking } from "../bookings/bookings.model";
import Listing from "../listings/listings.model";
import { Review } from "./reviews.model";

export const reviewService = {
  createReview: async (userId: string, payload: any) => {
    const { listing, rating, comment } = payload;

    // Check booking existence (only booked users can review)
    const hasBooking = await Booking.findOne({
      user: userId,
      listing,
      status: BookingStatus.CONFIRMED,
    });

    if (!hasBooking) {
      throw new AppError(403, "You can only review listings you booked");
    }

    // Create review
    const review = await Review.create({
      listing,
      user: userId,
      rating,
      comment,
    });

    // Update average rating
    const stats = await Review.aggregate([
      { $match: { listing } },
      { $group: { _id: "$listing", avgRating: { $avg: "$rating" } } },
    ]);

    await Listing.findByIdAndUpdate(listing, {
      averageRating: stats[0]?.avgRating || 0,
    });

    return review;
  },

  getReviewsOfListing: async (listingId: string) => {
    return await Review.find({ listing: listingId })
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });
  },

  updateReview: async (userId: string, reviewId: string, payload: any) => {
    const review = await Review.findOne({ _id: reviewId, user: userId });

    if (!review) {
      throw new AppError(403, "You are not allowed to edit this review");
    }

    Object.assign(review, payload);
    await review.save();

    return review;
  },

  deleteReview: async (userId: string, reviewId: string) => {
    const review = await Review.findOne({ _id: reviewId, user: userId });

    if (!review) {
      throw new AppError(403, "You are not allowed to delete this review");
    }

    await review.deleteOne();
    return true;
  },
};
