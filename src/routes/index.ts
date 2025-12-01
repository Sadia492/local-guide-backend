import { Router } from "express";
import authRoute from "../app/modules/auth/auth.route";
import userRoute from "../app/modules/users/users.route";
// import userRoute from "../app/modules/user/user.route";
// import authRouter from "../app/modules/auth/auth.route";
// import parcelRoute from "../app/modules/parcel/parcel.route";

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/user", userRoute);
// routes.use("/auth", authRouter);
// routes.use("/parcel", parcelRoute);

export default routes;
