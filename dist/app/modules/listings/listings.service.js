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
exports.listingService = void 0;
const listings_model_1 = __importDefault(require("./listings.model"));
const fileUploader_1 = require("../../../utils/fileUploader");
// const createListing = async (req: Request) => {
//   const payload = { ...req.body, guide: req.user._id };
//   if (req.file) {
//     const uploadResult = await fileUploader.uploadToCloudinary(req.file);
//     req.body.image = uploadResult?.secure_url;
//   }
//   return await Listing.create(payload);
// };
const createListing = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, req.body), { guide: req.user._id });
    // Handle multiple image uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => fileUploader_1.fileUploader.uploadToCloudinary(file));
        try {
            const uploadResults = yield Promise.all(uploadPromises);
            const imageUrls = uploadResults
                .filter((result) => result === null || result === void 0 ? void 0 : result.secure_url)
                .map((result) => result === null || result === void 0 ? void 0 : result.secure_url);
            payload.images = imageUrls;
        }
        catch (error) {
            console.error("Error uploading images:", error);
            // You might want to throw an error or handle this differently
        }
    }
    else if (req.file) {
        // Handle single image for backward compatibility
        const uploadResult = yield fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        if (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url) {
            payload.images = [uploadResult.secure_url];
        }
    }
    return yield listings_model_1.default.create(payload);
});
const getAllListings = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = {};
    if (query.city)
        filters.city = query.city;
    if (query.category)
        filters.category = query.category;
    if (query.language)
        filters.language = query.language;
    // price range filtering
    if (query.minPrice || query.maxPrice) {
        filters.fee = {};
        if (query.minPrice)
            filters.fee.$gte = Number(query.minPrice);
        if (query.maxPrice)
            filters.fee.$lte = Number(query.maxPrice);
    }
    return yield listings_model_1.default.find(filters).populate("guide", "name profilePic");
});
const getSingleListing = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield listings_model_1.default.findById(id).populate("guide", "name bio languages");
});
const updateListing = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield listings_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
});
const deleteListing = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield listings_model_1.default.findByIdAndDelete(id);
});
const updateListingStatus = (id, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    return yield listings_model_1.default.findByIdAndUpdate(id, { isActive }, {
        new: true,
        runValidators: true,
    });
});
const getMyListings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield listings_model_1.default.find({ guide: userId }).sort({ createdAt: -1 });
});
exports.listingService = {
    createListing,
    getAllListings,
    getSingleListing,
    updateListing,
    deleteListing,
    updateListingStatus, // Add this new function
    getMyListings,
};
