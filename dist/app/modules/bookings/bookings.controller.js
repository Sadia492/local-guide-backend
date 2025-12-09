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
exports.createPaymentSession = exports.getPendingBookings = exports.getUpcomingBookings = exports.updateBookingStatus = exports.getAllBookings = exports.getMyBookings = exports.createBooking = void 0;
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const bookings_service_1 = require("./bookings.service");
const bookings_interface_1 = require("./bookings.interface");
const users_interface_1 = require("../users/users.interface");
exports.createBooking = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const result = yield bookings_service_1.bookingService.createBooking(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 201,
        message: "Booking created successfully",
        data: result,
    });
}));
exports.getMyBookings = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const result = yield bookings_service_1.bookingService.getMyBookings(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "My bookings retrieved",
        data: result,
    });
}));
exports.getAllBookings = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bookings_service_1.bookingService.getAllBookings();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "All bookings retrieved",
        data: result,
    });
}));
exports.updateBookingStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;
    let result;
    if (status === bookings_interface_1.BookingStatus.CONFIRMED && user.role === users_interface_1.Role.GUIDE) {
        result = yield bookings_service_1.bookingService.updateBookingStatus(id, status, user._id);
    }
    else {
        result = yield bookings_service_1.bookingService.updateBookingStatus(id, status);
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result,
    });
}));
exports.getUpcomingBookings = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const result = yield bookings_service_1.bookingService.getUpcomingBookings(userId);
    let message = "Upcoming bookings retrieved successfully";
    if (result.length === 0) {
        message =
            "No upcoming bookings found. Share your listings to attract more travelers!";
    }
    else {
        message = `You have ${result.length} upcoming ${result.length === 1 ? "booking" : "bookings"}`;
    }
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message,
        data: result,
    });
}));
exports.getPendingBookings = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const result = yield bookings_service_1.bookingService.getPendingBookings(userId);
    let message = "Pending bookings retrieved successfully";
    if (result.length === 0) {
        message = "No pending booking requests. Keep promoting your listings!";
    }
    else {
        message = `You have ${result.length} pending ${result.length === 1 ? "request" : "requests"} awaiting your response`;
    }
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message,
        data: result,
    });
}));
exports.createPaymentSession = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user._id;
    const result = yield bookings_service_1.bookingService.createPaymentSession(id, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: {
            paymentUrl: result.paymentUrl,
            sessionId: result.sessionId,
        },
    });
}));
