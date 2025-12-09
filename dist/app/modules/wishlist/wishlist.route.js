"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistRoutes = void 0;
const express_1 = __importDefault(require("express"));
const wishlist_controller_1 = require("./wishlist.controller");
const auth_1 = require("../../../middleware/auth");
const users_interface_1 = require("../users/users.interface");
const router = express_1.default.Router();
router.post("/", (0, auth_1.auth)([users_interface_1.Role.TOURIST]), wishlist_controller_1.addToWishlist);
router.get("/", (0, auth_1.auth)([users_interface_1.Role.TOURIST]), wishlist_controller_1.getMyWishlist);
router.get("/check/:listingId", (0, auth_1.auth)([users_interface_1.Role.TOURIST]), wishlist_controller_1.checkListingInWishlist);
router.delete("/:listingId", (0, auth_1.auth)([users_interface_1.Role.TOURIST]), wishlist_controller_1.removeFromWishlist);
router.delete("/", (0, auth_1.auth)([users_interface_1.Role.TOURIST]), wishlist_controller_1.clearMyWishlist);
exports.wishlistRoutes = router;
