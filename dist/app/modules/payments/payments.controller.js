"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const catchAsync_1 = require("../../../utils/catchAsync");
const stripe_1 = require("../../../utils/stripe");
const sendResponse_1 = require("../../../utils/sendResponse");
const payments_service_1 = require("./payments.service");
const handleStripeWebhookEvent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = "whsec_930c987f6394ea021c0c955d5afac3c7c2bcc600d43d92a4157301d628d9d680";
    let event;
    try {
        event = stripe_1.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const result = yield payments_service_1.PaymentService.handleStripeWebhookEvent(event);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Webhook req send successfully",
        data: result,
    });
}));
exports.PaymentController = {
    handleStripeWebhookEvent,
};
