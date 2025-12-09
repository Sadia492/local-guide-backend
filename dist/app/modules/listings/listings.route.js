"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingRoute = void 0;
const express_1 = __importDefault(require("express"));
const listings_validation_1 = require("./listings.validation");
const listings_controller_1 = require("./listings.controller");
const validateRequest_1 = require("../../../middleware/validateRequest");
const auth_1 = require("../../../middleware/auth");
const users_interface_1 = require("../users/users.interface");
const fileUploader_1 = require("../../../utils/fileUploader");
const router = express_1.default.Router();
router.get("/", listings_controller_1.getAllListings);
router.get("/my-listings", (0, auth_1.auth)([users_interface_1.Role.GUIDE]), listings_controller_1.getMyListings);
router.get("/:id", (0, auth_1.auth)([users_interface_1.Role.GUIDE, users_interface_1.Role.ADMIN, users_interface_1.Role.TOURIST]), listings_controller_1.getSingleListing);
router.post("/", (0, auth_1.auth)([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE]), // must be logged in
fileUploader_1.fileUploader.upload.array("files", 5), (req, res, next) => {
    req.body = listings_validation_1.listingZodSchema.createListingZodSchema.parse(JSON.parse(req.body.data));
    return (0, listings_controller_1.createListing)(req, res, next);
}
// validateRequest(listingZodSchema.createListingZodSchema),
// createListing
);
router.patch("/:id", (0, auth_1.auth)([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE, users_interface_1.Role.TOURIST]), (0, validateRequest_1.validateRequest)(listings_validation_1.listingZodSchema.updateListingZodSchema), listings_controller_1.updateListing);
router.delete("/:id", (0, auth_1.auth)([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE, users_interface_1.Role.TOURIST]), listings_controller_1.deleteListing);
// Add this new route for updating status
router.patch("/:id/status", (0, auth_1.auth)([users_interface_1.Role.ADMIN, users_interface_1.Role.GUIDE]), listings_controller_1.updateListingStatus);
exports.listingRoute = router;
