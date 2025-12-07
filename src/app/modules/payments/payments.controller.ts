import { Request, Response } from "express";

import { catchAsync } from "../../../utils/catchAsync";
import { stripe } from "../../../utils/stripe";
import { sendResponse } from "../../../utils/sendResponse";
import { PaymentService } from "./payments.service";

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret =
      "whsec_930c987f6394ea021c0c955d5afac3c7c2bcc600d43d92a4157301d628d9d680";

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Webhook req send successfully",
      data: result,
    });
  }
);

export const PaymentController = {
  handleStripeWebhookEvent,
};
