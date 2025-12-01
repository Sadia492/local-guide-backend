import express from "express";

import { listingZodSchema } from "./listings.validation";

import {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
} from "./listings.controller";
import { validateRequest } from "../../../middleware/validateRequest";
import { auth } from "../../../middleware/auth";
import { Role } from "../users/users.interface";

const router = express.Router();

router.get("/", getAllListings);
router.get("/:id", getSingleListing);

router.post(
  "/",
  auth([Role.ADMIN, Role.GUIDE]), // must be logged in
  validateRequest(listingZodSchema.createListingZodSchema),
  createListing
);

router.patch(
  "/:id",
  auth([Role.ADMIN, Role.GUIDE, Role.TOURIST]),
  validateRequest(listingZodSchema.updateListingZodSchema),
  updateListing
);

router.delete(
  "/:id",
  auth([Role.ADMIN, Role.GUIDE, Role.TOURIST]),
  deleteListing
);

export const listingRoute = router;
