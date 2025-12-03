import { Router } from "express";
import { validateRequest } from "../../../middleware/validateRequest";
import { loginUser, logoutUser, registerUser } from "./auth.controller";
import { authZodSchema } from "./auth.validate";

const authRoute = Router();

authRoute.post(
  "/register",
  validateRequest(authZodSchema.userCreateZodSchema),
  registerUser
);

authRoute.post(
  "/login",
  // validateRequest(authZodSchema.userLoginZodSchema),
  loginUser
);

authRoute.post("/logout", logoutUser);
export default authRoute;
