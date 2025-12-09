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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistService = void 0;
const listings_model_1 = __importDefault(require("../listings/listings.model"));
const wishlist_model_1 = require("./wishlist.model");
const addToWishlist = (userId, listingId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if listing exists
    const listing = yield listings_model_1.default.findById(listingId);
    if (!listing) {
        throw new Error("Listing not found");
    }
    // Check if already in wishlist
    const existingWishlistItem = yield wishlist_model_1.Wishlist.findOne({
        user: userId,
        listing: listingId,
    });
    if (existingWishlistItem) {
        throw new Error("Listing already in wishlist");
    }
    // Add to wishlist
    const wishlistItem = yield wishlist_model_1.Wishlist.create({
        user: userId,
        listing: listingId,
    });
    return yield wishlistItem.populate({
        path: "listing",
        select: "title city fee duration images guide",
        populate: {
            path: "guide",
            select: "name profilePicture",
        },
    });
});
const removeFromWishlist = (userId, listingId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_model_1.Wishlist.findOneAndDelete({
        user: userId,
        listing: listingId,
    });
    if (!result) {
        throw new Error("Listing not found in wishlist");
    }
    return result;
});
const getUserWishlist = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wishlistItems = yield wishlist_model_1.Wishlist.find({ user: userId })
        .populate({
        path: "listing",
        select: "title city fee duration images guide status",
        populate: {
            path: "guide",
            select: "name profilePicture rating",
        },
    })
        .sort({ addedAt: -1 });
    return wishlistItems;
});
const checkInWishlist = (userId, listingId) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield wishlist_model_1.Wishlist.findOne({
        user: userId,
        listing: listingId,
    });
    return { isInWishlist: !!exists };
});
const clearWishlist = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_model_1.Wishlist.deleteMany({ user: userId });
    return result;
});
exports.wishlistService = {
    addToWishlist,
    removeFromWishlist,
    getUserWishlist,
    checkInWishlist,
    clearWishlist,
};
