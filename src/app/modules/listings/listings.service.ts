import { IListing } from "./listings.interface";
import Listing from "./listings.model";

const createListing = async (payload: IListing) => {
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
  return await Listing.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
};

export const listingService = {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
};
