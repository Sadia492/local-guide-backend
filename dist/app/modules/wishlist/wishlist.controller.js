"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearMyWishlist = exports.checkListingInWishlist = exports.getMyWishlist = exports.removeFromWishlist = exports.addToWishlist = void 0;
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const wishlist_service_1 = require("./wishlist.service");
exports.addToWishlist = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { listingId } = req.body;
    if (!listingId) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 400,
            success: false,
            message: "Listing ID is required",
            data: null,
        });
    }
    const result = yield wishlist_service_1.wishlistService.addToWishlist(userId, listingId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 201,
        message: "Added to wishlist successfully",
        data: result,
    });
}));
exports.removeFromWishlist = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { listingId } = req.params;
    const result = yield wishlist_service_1.wishlistService.removeFromWishlist(userId, listingId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Removed from wishlist successfully",
        data: result,
    });
}));
exports.getMyWishlist = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const wishlistItems = yield wishlist_service_1.wishlistService.getUserWishlist(userId);
    const isEmpty = wishlistItems.length === 0;
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: isEmpty
            ? "Your wishlist is empty"
            : `Found ${wishlistItems.length} tours in wishlist`,
        data: wishlistItems,
    });
}));
exports.checkListingInWishlist = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { listingId } = req.params;
    const result = yield wishlist_service_1.wishlistService.checkInWishlist(userId, listingId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: result.isInWishlist
            ? "Listing is in wishlist"
            : "Listing is not in wishlist",
        data: result,
    });
}));
exports.clearMyWishlist = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const result = yield wishlist_service_1.wishlistService.clearWishlist(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Wishlist cleared successfully",
        data: result,
    });
}));
