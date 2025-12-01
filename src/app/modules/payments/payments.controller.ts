// import catchAsync from "../../../utils/catchAsync";
// import { paymentService } from "./payment.service";

// export const paymentController = {
//   createPaymentIntent: catchAsync(async (req, res) => {
//     const { bookingId } = req.body;

//     const result = await paymentService.createPaymentIntent(
//       bookingId,
//       req.user._id
//     );

//     res.status(200).json({
//       success: true,
//       message: "Payment Intent created",
//       data: result,
//     });
//   }),

//   // Webhook endpoint
//   handleStripeWebhook: catchAsync(async (req, res) => {
//     const sig = req.headers["stripe-signature"];

//     let event;

//     try {
//       event = paymentService.constructWebhookEvent(req.rawBody, sig as string);
//     } catch (err: any) {
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "payment_intent.succeeded") {
//       const paymentIntent = event.data.object;
//       await paymentService.confirmPayment(paymentIntent.id);
//     }

//     res.json({ received: true });
//   }),
// };
