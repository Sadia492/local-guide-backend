import httpStatus from "http-status";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { listingService } from "./listings.service";
import { Role } from "../users/users.interface";

const createListing = catchAsync(async (req, res) => {
  // Only guides can create listings
  if (req.user.role !== Role.GUIDE) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.FORBIDDEN,
      message: "Only guides can create tour listings",
      data: null,
    });
  }

  const payload = { ...req.body, guide: req.user._id };

  const result = await listingService.createListing(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Listing created successfully",
    data: result,
  });
});

const getAllListings = catchAsync(async (req, res) => {
  const result = await listingService.getAllListings(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listings fetched successfully",
    data: result,
  });
});

const getSingleListing = catchAsync(async (req, res) => {
  const result = await listingService.getSingleListing(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing fetched successfully",
    data: result,
  });
});

const updateListing = catchAsync(async (req, res) => {
  const listing = await listingService.getSingleListing(req.params.id);

  if (!listing) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Listing not found",
      data: null,
    });
  }

  // Only owner guide or admin can update
  if (
    req.user.role !== "admin" &&
    listing.guide._id.toString() !== req.user._id.toString()
  ) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.FORBIDDEN,
      message: "You are not allowed to update this listing",
      data: null,
    });
  }

  const result = await listingService.updateListing(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listing updated successfully",
    data: result,
  });
});

const deleteListing = catchAsync(async (req, res) => {
  const listing = await listingService.getSingleListing(req.params.id);

  if (!listing) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Listing not found",
      data: null,
    });
  }

  // Only owner guide or admin can delete
  if (
    req.user.role !== "admin" &&
    listing.guide._id.toString() !== req.user._id.toString()
  ) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.FORBIDDEN,
      message: "You are not allowed to delete this listing",
      data: null,
    });
  }

  await listingService.deleteListing(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listing deleted successfully",
    data: null,
  });
});

export {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
};
