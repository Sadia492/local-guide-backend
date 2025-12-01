import Listing from "../listings/listings.model";
import { IBooking } from "./bookings.interface";
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

const updateBookingStatus = async (id: string, status: string) => {
  return await Booking.findByIdAndUpdate(id, { status }, { new: true });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};
