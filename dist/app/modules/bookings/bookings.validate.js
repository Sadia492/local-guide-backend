"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingZodSchema = exports.updateBookingStatusZodSchema = exports.createBookingZodSchema = void 0;
const zod_1 = require("zod");
const bookings_interface_1 = require("./bookings.interface");
exports.createBookingZodSchema = zod_1.z.object({
    listing: zod_1.z.string(),
    date: zod_1.z.string().datetime(),
    groupSize: zod_1.z.number().min(1),
});
exports.updateBookingStatusZodSchema = zod_1.z.object({
    status: zod_1.z.enum(bookings_interface_1.BookingStatus),
});
exports.bookingZodSchema = {
    createBookingZodSchema: exports.createBookingZodSchema,
    updateBookingStatusZodSchema: exports.updateBookingStatusZodSchema,
};
