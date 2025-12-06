import Listing from "../listings/listings.model";
import { Role } from "../users/users.interface";
import { BookingStatus, IBooking } from "./bookings.interface";
import { Booking } from "./bookings.model";

const createBooking = async (userId: string, payload: IBooking) => {
  // get listing fee
  const listing = await Listing.findById(payload.listing);
  if (!listing) throw new Error("Listing not found");

  const totalPrice = listing.fee * payload.groupSize;

  const booking = await Booking.create({
    ...payload,
    user: userId,
    totalPrice,
  });

  return booking;
};

const getMyBookings = async (userId: string) => {
  return await Booking.find({ user: userId })
    .populate("listing")
    .sort({ createdAt: -1 });
};
const getUpcomingBookings = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString();
  // For guides: get bookings for their listings
  const guideListings = await Listing.find({ guide: userId }).select("_id");
  const listingIds = guideListings.map((l) => l._id.toString()); // Convert to string!

  if (listingIds.length === 0) {
    console.log("No listings found for this guide");
    return [];
  }
  // First, let's check what bookings exist for these listings
  const allBookingsForListings = await Booking.find({
    listing: { $in: listingIds },
  }).lean();

  console.log(
    "ALL bookings for these listings (regardless of date/status):",
    allBookingsForListings.length
  );

  const result = await Booking.find({
    listing: { $in: listingIds },
    date: { $gte: todayString },
    status: { $in: [BookingStatus.CONFIRMED] },
  })
    .populate({
      path: "listing",
      select: "title city fee duration meetingPoint images guide",
      populate: {
        path: "guide",
        select: "name email profilePicture",
      },
    })
    .populate("user", "name email profilePicture")
    .sort({ date: 1 });

  return result;
};
const getPendingBookings = async (userId: string) => {
  const today = new Date().toISOString();

  // For guides: get PENDING bookings for their listings
  const guideListings = await Listing.find({ guide: userId }).select("_id");
  const listingIds = guideListings.map((l) => l._id.toString());

  return await Booking.find({
    listing: { $in: listingIds },
    status: BookingStatus.PENDING, // Only PENDING status
  })
    .populate({
      path: "listing",
      select: "title city fee duration meetingPoint images guide",
      populate: {
        path: "guide",
        select: "name email profilePicture",
      },
    })
    .populate("user", "name email profilePicture")
    .sort({ createdAt: -1 }); // Newest requests first
};

const getAllBookings = async () => {
  return await Booking.find({}).populate("listing").sort({ createdAt: -1 });
};

const updateBookingStatus = async (id: string, status: string) => {
  return await Booking.findByIdAndUpdate(id, { status }, { new: true });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
  getUpcomingBookings,
  getPendingBookings,
};
