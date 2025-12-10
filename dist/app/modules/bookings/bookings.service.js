"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = void 0;
const stripe_1 = require("../../../utils/stripe");
const listings_model_1 = __importDefault(require("../listings/listings.model"));
const payments_model_1 = require("../payments/payments.model");
const uuid_1 = require("uuid");
const users_model_1 = __importDefault(require("../users/users.model"));
const bookings_interface_1 = require("./bookings.interface");
const bookings_model_1 = require("./bookings.model");
const mongoose_1 = __importDefault(require("mongoose"));
const payments_interface_1 = require("../payments/payments.interface");
const { envVars } = require("../../config/env");
const createBooking = (userId, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
      session.startTransaction();
      const listing = yield listings_model_1.default
        .findById(payload.listing)
        .session(session);
      const user = yield users_model_1.default
        .findById(userId)
        .session(session);
      if (!listing || !user) {
        throw new Error("Listing or user not found");
      }
      if (!listing.isActive) {
        throw new Error("This tour is currently not available for booking");
      }
      const existingBooking = yield bookings_model_1.Booking.findOne({
        listing: payload.listing,
        date: payload.date,
        status: {
          $in: [
            bookings_interface_1.BookingStatus.CONFIRMED,
            bookings_interface_1.BookingStatus.COMPLETED,
          ],
        },
      }).session(session);
      if (existingBooking) {
        throw new Error("Guide is not available on this date");
      }
      const totalPrice = listing.fee * payload.groupSize;
      const booking = yield bookings_model_1.Booking.create(
        [
          Object.assign(Object.assign({}, payload), {
            user: new mongoose_1.default.Types.ObjectId(userId),
            totalPrice,
            status: bookings_interface_1.BookingStatus.PENDING,
          }),
        ],
        { session }
      );
      const bookingDoc = booking[0];
      const payment = yield payments_model_1.Payment.create(
        [
          {
            booking: bookingDoc._id,
            status: payments_interface_1.PaymentStatus.UNPAID,
            method: "stripe",
            amount: totalPrice,
            currency: "usd",
          },
        ],
        { session }
      );
      const paymentDoc = payment[0];
      bookingDoc.payment = paymentDoc._id;
      yield bookingDoc.save({ session });
      yield session.commitTransaction();
      return {
        success: true,
        bookingId: bookingDoc._id,
        message: "Booking request sent to guide. Awaiting acceptance.",
      };
    } catch (error) {
      yield session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });
const updateBookingStatus = (id, status, guideId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
      session.startTransaction();
      const booking = yield bookings_model_1.Booking.findById(id)
        .populate("listing")
        .session(session);
      if (!booking) {
        throw new Error("Booking not found");
      }
      if (status === bookings_interface_1.BookingStatus.CONFIRMED) {
        if (!guideId) {
          throw new Error("Guide ID required to confirm booking");
        }
        const listing = booking.listing;
        if (!listing || listing.guide.toString() !== guideId.toString()) {
          throw new Error("Not authorized to confirm this booking");
        }
        if (booking.status !== bookings_interface_1.BookingStatus.PENDING) {
          throw new Error("Booking cannot be confirmed (already processed)");
        }
        const payment = yield payments_model_1.Payment.findById(
          booking.payment
        ).session(session);
        if (!payment) {
          throw new Error("Payment not found for this booking");
        }
        const tourist = yield users_model_1.default
          .findById(booking.user)
          .session(session);
        if (!tourist) {
          throw new Error("User not found");
        }
        booking.status = bookings_interface_1.BookingStatus.CONFIRMED;
        yield booking.save({ session });
        yield session.commitTransaction();
        return {
          success: true,
          booking: booking,
          message:
            "Booking confirmed. Tourist has 24 hours to complete payment.",
        };
      } else if (status === bookings_interface_1.BookingStatus.CANCELLED) {
        if (booking.status === bookings_interface_1.BookingStatus.COMPLETED) {
          throw new Error("Cannot cancel a booking that has already been paid");
        }
        booking.status = bookings_interface_1.BookingStatus.CANCELLED;
        yield booking.save({ session });
        yield payments_model_1.Payment.findByIdAndUpdate(
          booking.payment,
          { status: payments_interface_1.PaymentStatus.UNPAID },
          { session }
        );
        const payment = yield payments_model_1.Payment.findById(
          booking.payment
        ).session(session);
        if (
          payment === null || payment === void 0
            ? void 0
            : payment.transactionId
        ) {
          try {
            yield stripe_1.stripe.checkout.sessions.expire(
              payment.stripeSessionId || payment.transactionId
            );
          } catch (err) {
            console.error("Error expiring Stripe session:", err);
          }
        }
        yield session.commitTransaction();
        return {
          success: true,
          booking: booking,
          message: "Booking cancelled successfully",
        };
      } else {
        booking.status = status;
        yield booking.save({ session });
        yield session.commitTransaction();
        return {
          success: true,
          booking: booking,
          message: "Booking status updated successfully",
        };
      }
    } catch (error) {
      yield session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });
const createPaymentSession = (bookingId, userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
      session.startTransaction();
      const booking = yield bookings_model_1.Booking.findById(bookingId)
        .populate("listing")
        .populate("user")
        .session(session);
      if (!booking) {
        throw new Error("Booking not found");
      }
      if (booking.user._id.toString() !== userId.toString()) {
        throw new Error("Not authorized to pay for this booking");
      }
      if (booking.status !== bookings_interface_1.BookingStatus.CONFIRMED) {
        throw new Error("Booking is not in a payable state");
      }
      const payment = yield payments_model_1.Payment.findById(
        booking.payment
      ).session(session);
      if (!payment) {
        throw new Error("Payment not found");
      }
      if (payment.status === payments_interface_1.PaymentStatus.PAID) {
        throw new Error("Booking already paid");
      }
      if (payment.stripeSessionId) {
        try {
          const existingSession =
            yield stripe_1.stripe.checkout.sessions.retrieve(
              payment.stripeSessionId
            );
          if (existingSession.status === "open") {
            yield session.commitTransaction();
            return {
              success: true,
              paymentUrl: existingSession.url,
              sessionId: payment.stripeSessionId,
              message: "Payment session retrieved",
            };
          } else if (existingSession.status === "expired") {
          }
        } catch (error) {}
      }
      const listing = booking.listing;
      const tourist = booking.user;
      const stripeSession = yield stripe_1.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: tourist.email,
        metadata: {
          bookingId: booking._id.toString(),
          paymentId: payment._id.toString(),
          userId: booking.user._id.toString(),
          listingId: listing._id.toString(),
        },
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${listing.title} - Tour Booking`,
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
          envVars.FRONTEND_URL
        }/dashboard/tourist/my-trips?payment=success&bookingId=${booking._id.toString()}`,
        cancel_url: `${envVars.FRONTEND_URL}/tours/${listing._id.toString()}`,
      });
      payment.transactionId = payment.transactionId || (0, uuid_1.v4)();
      payment.stripeSession = stripeSession;
      payment.stripeSessionId = stripeSession.id;
      yield payment.save({ session });
      yield session.commitTransaction();
      return {
        success: true,
        paymentUrl: stripeSession.url,
        sessionId: stripeSession.id,
        message: "Payment session created",
      };
    } catch (error) {
      yield session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });
const getMyBookings = (userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield bookings_model_1.Booking.find({ user: userId })
      .populate("listing")
      .sort({ createdAt: -1 });
  });
const getUpcomingBookings = (userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString();
    const guideListings = yield listings_model_1.default
      .find({
        guide: userId,
        isActive: true,
      })
      .select("_id");
    const listingIds = guideListings.map((l) => l._id.toString());
    if (listingIds.length === 0) {
      return [];
    }
    const allBookingsForListings = yield bookings_model_1.Booking.find({
      listing: { $in: listingIds },
    }).lean();
    const result = yield bookings_model_1.Booking.find({
      listing: { $in: listingIds },
      date: { $gte: todayString },
      status: {
        $in: [
          bookings_interface_1.BookingStatus.CONFIRMED,
          bookings_interface_1.BookingStatus.COMPLETED,
        ],
      },
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
  });
const getPendingBookings = (userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date().toISOString();
    const guideListings = yield listings_model_1.default
      .find({ guide: userId })
      .select("_id");
    const listingIds = guideListings.map((l) => l._id.toString());
    return yield bookings_model_1.Booking.find({
      listing: { $in: listingIds },
      status: bookings_interface_1.BookingStatus.PENDING,
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
      .sort({ createdAt: -1 });
  });
const getAllBookings = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield bookings_model_1.Booking.find({})
      .populate("listing")
      .sort({ createdAt: -1 });
  });
exports.bookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
  getUpcomingBookings,
  getPendingBookings,
  createPaymentSession,
};
