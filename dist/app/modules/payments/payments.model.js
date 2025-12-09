"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const payments_interface_1 = require("./payments.interface");
const paymentSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: Object.values(payments_interface_1.PaymentStatus),
        default: payments_interface_1.PaymentStatus.UNPAID,
    },
    booking: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
    },
    method: {
        type: String,
        enum: ["stripe", "cash", "bank_transfer", "none"],
        required: true,
    },
    transactionId: String, // Your uuid
    stripeSessionId: String, // Stripe's session ID
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    paymentDate: { type: Date, default: Date.now },
    refundId: String,
    refundDate: Date,
    stripeSession: mongoose_1.Schema.Types.Mixed, // Full session object
    notes: String,
}, { timestamps: true, versionKey: false });
exports.Payment = (0, mongoose_1.model)("Payment", paymentSchema);
