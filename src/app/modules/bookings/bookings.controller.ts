import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { bookingService } from "./bookings.service";

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await bookingService.createBooking(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Booking created successfully",
    data: result,
  });
});

export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await bookingService.getMyBookings(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "My bookings retrieved",
    data: result,
  });
});
export const getAllBookings = catchAsync(
  async (req: Request, res: Response) => {
    // const userId = req.user._id;
    const result = await bookingService.getAllBookings();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "All bookings retrieved",
      data: result,
    });
  }
);

export const updateBookingStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await bookingService.updateBookingStatus(
      id,
      req.body.status
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Booking status updated",
      data: result,
    });
  }
);
