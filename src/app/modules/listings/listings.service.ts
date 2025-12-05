import { Request } from "express";
import { IListing } from "./listings.interface";
import Listing from "./listings.model";
import { fileUploader } from "../../../utils/fileUploader";

// const createListing = async (req: Request) => {
//   const payload = { ...req.body, guide: req.user._id };
//   if (req.file) {
//     const uploadResult = await fileUploader.uploadToCloudinary(req.file);
//     req.body.image = uploadResult?.secure_url;
//   }
//   return await Listing.create(payload);
// };

const createListing = async (req: Request) => {
  const payload = { ...req.body, guide: req.user._id };

  // Handle multiple image uploads
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const uploadPromises = req.files.map((file: Express.Multer.File) =>
      fileUploader.uploadToCloudinary(file)
    );

    try {
      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults
        .filter((result) => result?.secure_url)
        .map((result) => result?.secure_url);

      payload.images = imageUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      // You might want to throw an error or handle this differently
    }
  } else if (req.file) {
    // Handle single image for backward compatibility
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    if (uploadResult?.secure_url) {
      payload.images = [uploadResult.secure_url];
    }
  }

  return await Listing.create(payload);
};

const getAllListings = async (query: any) => {
  const filters: any = {};

  if (query.city) filters.city = query.city;
  if (query.category) filters.category = query.category;
  if (query.language) filters.language = query.language;

  // price range filtering
  if (query.minPrice || query.maxPrice) {
    filters.fee = {};
    if (query.minPrice) filters.fee.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.fee.$lte = Number(query.maxPrice);
  }

  return await Listing.find(filters).populate("guide", "name profilePic");
};

const getSingleListing = async (id: string) => {
  return await Listing.findById(id).populate("guide", "name bio languages");
};

const updateListing = async (id: string, payload: Partial<IListing>) => {
  return await Listing.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteListing = async (id: string) => {
  return await Listing.findByIdAndDelete(id);
};

const updateListingStatus = async (id: string, isActive: boolean) => {
  return await Listing.findByIdAndUpdate(
    id,
    { isActive },
    {
      new: true,
      runValidators: true,
    }
  );
};
const getMyListings = async (userId: string) => {
  return await Listing.find({ guide: userId }).sort({ createdAt: -1 });
};
export const listingService = {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  updateListingStatus, // Add this new function
  getMyListings,
};
