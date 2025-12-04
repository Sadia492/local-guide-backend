import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { userService } from "./users.service";
import { Role } from "./users.interface";

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});
const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user; // already a User object
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your profile Retrieved Successfully",
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;

  // Check if someone is trying to update another user
  if (req.user.role !== Role.ADMIN && req.user._id.toString() !== userId) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "You are not allowed to update this profile",
      data: null,
    });
  }

  const result = await userService.updateUser(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

export { getMe, getSingleUser, updateUser };
