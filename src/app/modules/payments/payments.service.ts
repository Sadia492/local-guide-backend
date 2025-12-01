// // import Stripe from "stripe";
// // import envVars from "../../../config/envVars";
// // import { Booking } from "../booking/booking.model";
// // import { Payment } from "./payment.model";
// // import AppError from "../../errors/AppError";

// import AppError from "../../../error/AppError";
// import { envVars } from "../../config/env";
// import { Booking } from "../bookings/bookings.model";
// import { PaymentStatus } from "./payments.interface";
// import { Payment } from "./payments.model";

// const stripe = new Stripe(envVars.STRIPE_SECRET_KEY as string);

// export const paymentService = {
//   // Create a Stripe PaymentIntent
//   createPaymentIntent: async (bookingId: string, userId: string) => {
//     const booking = await Booking.findOne({ _id: bookingId, user: userId })
//       .populate("listing");

//     if (!booking) {
//       throw new AppError(404, "Booking not found");
//     }

//     const amount = booking.totalPrice * 100; // cents

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: "usd",
//       metadata: {
//         bookingId: booking._id.toString(),
//         userId: userId,
//       },
//     });

//     // Save payment to DB
//     const payment = await Payment.create({
//       booking: booking._id,
//       amount: booking.totalPrice,
//       currency: "usd",
//       status: PaymentStatus.PENDING,
//       paymentIntentId: paymentIntent.id,
//     });

//     return {
//       clientSecret: paymentIntent.client_secret,
//       payment,
//     };
//   },

//   // Confirm payment (from webhook)
//   confirmPayment: async (paymentIntentId: string) => {
//     const payment = await Payment.findOne({ paymentIntentId });

//     if (!payment) throw new AppError(404, "Payment not found");

//     payment.status = PaymentStatus.PAID;
//     await payment.save();

//     await Booking.findByIdAndUpdate(payment.booking, { status: "PAID" });

//     return payment;
//   },
// };
