// import express from "express";
// import { paymentController } from "./payment.controller";
// import auth from "../../middleware/auth";

// const router = express.Router();

// router.post(
//   "/create-intent",
//   auth("user"),
//   paymentController.createPaymentIntent
// );

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }), // IMPORTANT
//   paymentController.handleStripeWebhook
// );

// export const paymentRoutes = router;
