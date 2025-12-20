import { Router } from "express";
import express from "express";

import { Role } from "../users/users.interface";
import { auth } from "../../../middleware/auth";
import { MetaController } from "./meta.controller";

const metaRoute = express.Router();

// Dashboard stats for current user (based on their role)
metaRoute.get(
  "/dashboard",

  MetaController.getDashboardStats
);

// Admin-only dashboard stats (full platform overview)
metaRoute.get(
  "/dashboard/admin",

  MetaController.getAdminDashboardStats
);

// Chart data for visualizations
metaRoute.get("/charts", MetaController.getChartData);

export default metaRoute;
