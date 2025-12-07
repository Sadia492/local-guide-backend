import { IPayment } from "./../payments/payments.interface";
import { stripe } from "../../../utils/stripe";
import Listing from "../listings/listings.model";
import { Payment } from "../payments/payments.model";
import { Role } from "../users/users.interface";
import { v4 as uuidv4 } from "uuid";
import User from "../users/users.model";
import { BookingStatus, IBooking } from "./bookings.interface";
import { Booking } from "./bookings.model";
import mongoose from "mongoose";
import { PaymentStatus } from "../payments/payments.interface";

// const createBooking = async (userId: string, payload: IBooking) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     // 1. Get listing and user
//     const listing = await Listing.findById(payload.listing).session(session);
//     const user = await User.findById(userId).session(session);

//     if (!listing || !user) {
//       throw new Error("Listing or user not found");
//     }

//     // Check if guide is available on requested date
//     const existingBooking = await Booking.findOne({
//       listing: payload.listing,
//       date: payload.date,
//       status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
//     }).session(session);

//     if (existingBooking) {
//       throw new Error("Guide is not available on this date");
//     }

//     // 2. Calculate total price
//     const totalPrice = listing.fee * payload.groupSize;

//     // 3. Create booking - Status: PENDING (waiting for guide acceptance)
//     const booking = await Booking.create(
//       [
//         {
//           ...payload,
//           user: new mongoose.Types.ObjectId(userId),
//           totalPrice,
//           status: BookingStatus.PENDING,
//         },
//       ],
//       { session }
//     );

//     const bookingDoc = booking[0];

//     // 4. Create payment - Status: UNPAID
//     const payment = await Payment.create(
//       [
//         {
//           booking: bookingDoc._id,
//           status: PaymentStatus.UNPAID,
//           method: "stripe",
//           amount: totalPrice,
//           currency: "usd",
//         },
//       ],
//       { session }
//     );

//     const paymentDoc = payment[0];

//     // 5. Update booking with payment reference
//     bookingDoc.payment = paymentDoc._id;
//     await bookingDoc.save({ session });

//     // 6. DO NOT create Stripe session yet - wait for guide acceptance
//     // Guide must accept first, then Stripe session will be created

//     // 7. Commit transaction
//     await session.commitTransaction();

//     return {
//       success: true,
//       bookingId: bookingDoc._id,
//       message: "Booking request sent to guide. Awaiting acceptance.",
//     };
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };

// booking.service.ts - Simplified version
const createBooking = async (userId: string, payload: IBooking) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Get listing and user
    const listing = await Listing.findById(payload.listing).session(session);
    const user = await User.findById(userId).session(session);

    if (!listing || !user) {
      throw new Error("Listing or user not found");
    }

    // Check if guide is available on requested date
    const existingBooking = await Booking.findOne({
      listing: payload.listing,
      date: payload.date,
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
    }).session(session);

    if (existingBooking) {
      throw new Error("Guide is not available on this date");
    }

    // 2. Calculate total price
    const totalPrice = listing.fee * payload.groupSize;

    // 3. Create booking - Status: PENDING
    const booking = await Booking.create(
      [
        {
          ...payload,
          user: new mongoose.Types.ObjectId(userId),
          totalPrice,
          status: BookingStatus.PENDING,
        },
      ],
      { session }
    );

    const bookingDoc = booking[0];

    // 4. Create payment - Status: UNPAID
    const payment = await Payment.create(
      [
        {
          booking: bookingDoc._id,
          status: PaymentStatus.UNPAID,
          method: "stripe",
          amount: totalPrice,
          currency: "usd",
        },
      ],
      { session }
    );

    const paymentDoc = payment[0];

    // 5. Update booking with payment reference
    bookingDoc.payment = paymentDoc._id;
    await bookingDoc.save({ session });

    // 6. Commit transaction
    await session.commitTransaction();

    return {
      success: true,
      bookingId: bookingDoc._id,
      message: "Booking request sent to guide. Awaiting acceptance.",
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Updated updateBookingStatus function
// Updated updateBookingStatus function
const updateBookingStatus = async (
  id: string,
  status: string,
  guideId?: string
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find booking with listing populated
    const booking = await Booking.findById(id)
      .populate("listing")
      .session(session);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // For CONFIRMED status (guide accepting), verify guide authorization
    if (status === BookingStatus.CONFIRMED) {
      if (!guideId) {
        throw new Error("Guide ID required to confirm booking");
      }

      // Since booking.listing is populated, we need to cast it
      const listing = booking.listing as any;

      if (!listing || listing.guide.toString() !== guideId.toString()) {
        throw new Error("Not authorized to confirm this booking");
      }

      // Check if booking is still PENDING
      if (booking.status !== BookingStatus.PENDING) {
        throw new Error("Booking cannot be confirmed (already processed)");
      }

      // Find associated payment
      const payment = await Payment.findById(booking.payment).session(session);

      if (!payment) {
        throw new Error("Payment not found for this booking");
      }

      // Get tourist data
      const tourist = await User.findById(booking.user).session(session);

      if (!tourist) {
        throw new Error("User not found");
      }

      // Add debug logs with correct access
      console.log("=== DEBUG URLS ===");
      console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
      console.log("booking.listing type:", typeof listing);
      console.log("listing._id:", listing._id);
      console.log("listing._id.toString():", listing._id.toString());
      console.log("booking._id.toString():", booking._id.toString());

      // Create Stripe checkout session for tourist to pay
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: tourist.email,
        metadata: {
          bookingId: booking._id.toString(),
          paymentId: payment._id.toString(),
          userId: booking.user.toString(),
          listingId: listing._id.toString(), // Use listing._id.toString()
        },
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${listing.title} - Tour Booking`, // Use listing.title
                description: `Booking for ${tourist.name} on ${booking.date}`,
                images:
                  listing.images.length > 0 ? [listing.images[0]] : undefined,
              },
              unit_amount: booking.totalPrice * 100,
            },
            quantity: 1,
          },
        ],
        expires_at: Math.floor(Date.now() / 1000) + 23 * 60 * 60 + 59 * 60,
        success_url: `${
          process.env.FRONTEND_URL
        }/dashboard/tourist/my-trips?payment=success&bookingId=${booking._id.toString()}`,
        cancel_url: `${
          process.env.FRONTEND_URL
        }/tours/${listing._id.toString()}`, // Use listing._id.toString()
      });

      console.log(
        "Success URL:",
        `${
          process.env.FRONTEND_URL
        }/dashboard/tourist/my-trips?payment=success&bookingId=${booking._id.toString()}`
      );
      console.log(
        "Cancel URL:",
        `${process.env.FRONTEND_URL}/tours/${listing._id.toString()}`
      );

      // Update payment with Stripe session ID and generate a transaction ID
      const transactionId = uuidv4();
      payment.transactionId = transactionId;
      payment.stripeSession = stripeSession;
      payment.stripeSessionId = stripeSession.id;
      await payment.save({ session });

      // Update booking status to CONFIRMED
      booking.status = BookingStatus.CONFIRMED;
      await booking.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        booking: booking,
        message: "Booking confirmed. Tourist has 24 hours to complete payment.",
        paymentUrl: stripeSession.url,
        sessionId: stripeSession.id,
        transactionId: transactionId,
      };
    }

    // For CANCELLED status - also need to fix this part
    else if (status === BookingStatus.CANCELLED) {
      // Check if booking is already COMPLETED (paid)
      if (booking.status === BookingStatus.COMPLETED) {
        throw new Error("Cannot cancel a booking that has already been paid");
      }

      // Update booking status to CANCELLED
      booking.status = BookingStatus.CANCELLED;
      await booking.save({ session });

      // Update payment status stays UNPAID
      await Payment.findByIdAndUpdate(
        booking.payment,
        { status: PaymentStatus.UNPAID },
        { session }
      );

      // If there's a Stripe session, expire it
      const payment = await Payment.findById(booking.payment).session(session);
      if (payment?.transactionId) {
        try {
          await stripe.checkout.sessions.expire(
            payment.stripeSessionId || payment.transactionId
          );
        } catch (err) {
          console.error("Error expiring Stripe session:", err);
        }
      }

      await session.commitTransaction();

      return {
        success: true,
        booking: booking,
        message: "Booking cancelled successfully",
      };
    }

    // For other status updates (like ADMIN changing status)
    else {
      booking.status = status as BookingStatus;
      await booking.save({ session });
      await session.commitTransaction();

      return {
        success: true,
        booking: booking,
        message: "Booking status updated successfully",
      };
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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
    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
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

// const updateBookingStatus = async (id: string, status: string) => {
//   return await Booking.findByIdAndUpdate(id, { status }, { new: true });
// };

export const bookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
  getUpcomingBookings,
  getPendingBookings,
};
