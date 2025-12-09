"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoute = void 0;
const express_1 = require("express");
const auth_1 = require("../../../middleware/auth");
const users_interface_1 = require("../users/users.interface");
const validateRequest_1 = require("../../../middleware/validateRequest");
const bookings_validate_1 = require("./bookings.validate");
const bookings_controller_1 = require("./bookings.controller");
const router = (0, express_1.Router)();
router.post("/", (0, auth_1.auth)([users_interface_1.Role.TOURIST, users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN]), (0, validateRequest_1.validateRequest)(bookings_validate_1.bookingZodSchema.createBookingZodSchema), bookings_controller_1.createBooking);
router.get("/my-bookings", (0, auth_1.auth)([users_interface_1.Role.TOURIST, users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN]), bookings_controller_1.getMyBookings);
router.get("/all-bookings", (0, auth_1.auth)([users_interface_1.Role.ADMIN]), bookings_controller_1.getAllBookings);
// Only admin or guide can update status
router.patch("/:id/status", (0, auth_1.auth)([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE, users_interface_1.Role.TOURIST]), (0, validateRequest_1.validateRequest)(bookings_validate_1.bookingZodSchema.updateBookingStatusZodSchema), bookings_controller_1.updateBookingStatus);
router.get("/upcoming", (0, auth_1.auth)([users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN]), bookings_controller_1.getUpcomingBookings);
router.get("/pending", (0, auth_1.auth)([users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN]), bookings_controller_1.getPendingBookings);
router.post("/:id/create-payment", (0, auth_1.auth)([users_interface_1.Role.TOURIST]), bookings_controller_1.createPaymentSession);
exports.bookingRoute = router;
