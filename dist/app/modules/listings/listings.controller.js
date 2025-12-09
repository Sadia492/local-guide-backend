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
exports.getMyListings = exports.updateListingStatus = exports.deleteListing = exports.updateListing = exports.getSingleListing = exports.getAllListings = exports.createListing = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const listings_service_1 = require("./listings.service");
const users_interface_1 = require("../users/users.interface");
const createListing = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, req.body), { guide: req.user._id });
    const result = yield listings_service_1.listingService.createListing(req);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Listing created successfully",
        data: result,
    });
}));
exports.createListing = createListing;
const getAllListings = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield listings_service_1.listingService.getAllListings(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Listings fetched successfully",
        data: result,
    });
}));
exports.getAllListings = getAllListings;
const getSingleListing = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield listings_service_1.listingService.getSingleListing(req.params.id);
    if (!result) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "Listing not found",
            data: null,
        });
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Listing fetched successfully",
        data: result,
    });
}));
exports.getSingleListing = getSingleListing;
const getMyListings = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const result = yield listings_service_1.listingService.getMyListings(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "My listings retrieved",
        data: result,
    });
}));
exports.getMyListings = getMyListings;
const updateListing = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listing = yield listings_service_1.listingService.getSingleListing(req.params.id);
    if (!listing) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "Listing not found",
            data: null,
        });
    }
    if (req.user.role !== users_interface_1.Role.ADMIN &&
        listing.guide._id.toString() !== req.user._id.toString()) {
        return (0, sendResponse_1.sendResponse)(res, {
            success: false,
            statusCode: http_status_1.default.FORBIDDEN,
            message: "You are not allowed to update this listing",
            data: null,
        });
    }
    const result = yield listings_service_1.listingService.updateListing(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Listing updated successfully",
        data: result,
    });
}));
exports.updateListing = updateListing;
const deleteListing = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listing = yield listings_service_1.listingService.getSingleListing(req.params.id);
    if (!listing) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "Listing not found",
            data: null,
        });
    }
    if (req.user.role !== "ADMIN" &&
        listing.guide._id.toString() !== req.user._id.toString()) {
        return (0, sendResponse_1.sendResponse)(res, {
            success: false,
            statusCode: http_status_1.default.FORBIDDEN,
            message: "You are not allowed to delete this listing",
            data: null,
        });
    }
    yield listings_service_1.listingService.deleteListing(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Listing deleted successfully",
        data: null,
    });
}));
exports.deleteListing = deleteListing;
const updateListingStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
        return (0, sendResponse_1.sendResponse)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "isActive must be a boolean value",
            data: null,
        });
    }
    const listing = yield listings_service_1.listingService.getSingleListing(id);
    if (!listing) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "Listing not found",
            data: null,
        });
    }
    if (req.user.role !== users_interface_1.Role.ADMIN &&
        listing.guide._id.toString() !== req.user._id.toString()) {
        return (0, sendResponse_1.sendResponse)(res, {
            success: false,
            statusCode: http_status_1.default.FORBIDDEN,
            message: "You are not allowed to update this listing's status",
            data: null,
        });
    }
    const result = yield listings_service_1.listingService.updateListingStatus(id, isActive);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: `Listing ${isActive ? "activated" : "deactivated"} successfully`,
        data: result,
    });
}));
exports.updateListingStatus = updateListingStatus;
