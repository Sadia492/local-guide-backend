import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../../utils/sendResponse";
import { envVars } from "../../config/env";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const data = await authService.registerUser(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered Successfully",
    data,
  });
});
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const data = await authService.loginUser(payload);

  // For production: use 'none' and secure: true
  const isProduction = envVars.NODE_ENV === "production";

  // Set cookies with proper domain for cross-domain usage
  //   res.cookie("accessToken", data.accessToken, {
  //     httpOnly: true,
  //     secure: envVars.NODE_ENV === "production",
  //     sameSite: "none",
  //   });

  //   res.cookie("refreshToken", data.refreshToken, {
  //     httpOnly: true,
  //     secure: envVars.NODE_ENV === "production",
  //     sameSite: "none",
  //   });

  res.cookie("accessToken", data.accessToken, {
    secure: envVars.NODE_ENV !== "development",
    httpOnly: true,
    sameSite: "strict",
  });

  res.cookie("refreshToken", data.refreshToken, {
    secure: envVars.NODE_ENV !== "development",
    httpOnly: true,
    sameSite: "strict",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Login Successfully",
    data,
  });
});

export { registerUser, loginUser };
