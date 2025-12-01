import { Router } from "express";
import { validateRequest } from "../../../middleware/validateRequest";
import { loginUser, registerUser } from "./auth.controller";
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
export default authRoute;
