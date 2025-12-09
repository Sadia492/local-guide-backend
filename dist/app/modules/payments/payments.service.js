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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const bookings_model_1 = require("../bookings/bookings.model");
const bookings_interface_1 = require("../bookings/bookings.interface");
const payments_interface_1 = require("./payments.interface");
const payments_model_1 = require("./payments.model");
const mongoose_1 = __importDefault(require("mongoose"));
const handleStripeWebhookEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            const bookingId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.bookingId;
            const paymentId = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.paymentId;
            if (!bookingId || !paymentId) {
                break;
            }
            const mongooseSession = yield mongoose_1.default.startSession();
            try {
                mongooseSession.startTransaction();
                const booking = yield bookings_model_1.Booking.findById(bookingId).session(mongooseSession);
                const payment = yield payments_model_1.Payment.findById(paymentId).session(mongooseSession);
                if (!booking || !payment) {
                    throw new Error("Booking or Payment not found");
                }
                if (booking.status !== bookings_interface_1.BookingStatus.CONFIRMED) {
                    throw new Error("Booking is not in CONFIRMED state for payment");
                }
                payment.status = payments_interface_1.PaymentStatus.PAID;
                payment.stripeSessionId = session.id;
                payment.paymentDate = new Date();
                payment.stripeSession = session;
                yield payment.save({ session: mongooseSession });
                booking.status = bookings_interface_1.BookingStatus.COMPLETED;
                yield booking.save({ session: mongooseSession });
                yield mongooseSession.commitTransaction();
            }
            catch (error) {
                yield mongooseSession.abortTransaction();
                console.error("Error processing payment webhook:", error);
            }
            finally {
                mongooseSession.endSession();
            }
            break;
        }
        case "checkout.session.expired":
        case "checkout.session.async_payment_failed":
        case "payment_intent.payment_failed": {
            const session = event.data.object;
            const bookingId = (_c = session.metadata) === null || _c === void 0 ? void 0 : _c.bookingId;
            const paymentId = (_d = session.metadata) === null || _d === void 0 ? void 0 : _d.paymentId;
            if (bookingId && paymentId) {
                yield payments_model_1.Payment.findByIdAndUpdate(paymentId, {
                    status: payments_interface_1.PaymentStatus.UNPAID,
                });
                console.log(`Payment failed for booking: ${bookingId}. Booking remains CONFIRMED for retry.`);
            }
            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
    return { success: true, event: event.type };
});
exports.PaymentService = {
    handleStripeWebhookEvent,
};
