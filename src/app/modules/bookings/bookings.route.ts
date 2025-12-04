import { Router } from "express";
import { auth } from "../../../middleware/auth";
import { Role } from "../users/users.interface";
import { validateRequest } from "../../../middleware/validateRequest";
import { bookingZodSchema } from "./bookings.validate";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  updateBookingStatus,
} from "./bookings.controller";

const router = Router();

router.post(
  "/",
  auth([Role.TOURIST, Role.GUIDE, Role.ADMIN]),
  validateRequest(bookingZodSchema.createBookingZodSchema),
  createBooking
);

router.get(
  "/my-bookings",
  auth([Role.TOURIST, Role.GUIDE, Role.ADMIN]),
  getMyBookings
);
router.get("/all-bookings", auth([Role.ADMIN]), getAllBookings);

// Only admin or guide can update status
router.patch(
  "/:id/status",
  auth([Role.ADMIN, Role.GUIDE]),
  validateRequest(bookingZodSchema.updateBookingStatusZodSchema),
  updateBookingStatus
);

export const bookingRoute = router;
