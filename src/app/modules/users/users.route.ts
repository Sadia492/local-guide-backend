import { Router } from "express";
import { Role } from "./users.interface";
import { auth } from "../../../middleware/auth";
import { getMe, getSingleUser, updateUser } from "./users.controller";
import { validateRequest } from "../../../middleware/validateRequest";
import { updateUserZodSchema } from "./users.validate";

const userRoute = Router();

userRoute.get("/me", auth([Role.ADMIN, Role.GUIDE, Role.TOURIST]), getMe);
userRoute.get("/:id", getSingleUser);
userRoute.patch(
  "/:id",
  auth([Role.ADMIN, Role.GUIDE, Role.TOURIST]), // must be logged in
  validateRequest(updateUserZodSchema),
  updateUser
);
export default userRoute;
