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
const createListing = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, req.body), { guide: req.user._id });
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => fileUploader_1.fileUploader.uploadToCloudinary(file));
        try {
            const uploadResults = yield Promise.all(uploadPromises);
            const imageUrls = uploadResults
                .filter((result) => result && result.secure_url)
                .map((result) => result.secure_url);
            payload.images = imageUrls;
        }
        catch (error) {
            console.error("Error uploading images:", error);
        }
    }
    else if (req.file) {
        const uploadResult = yield fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        if (uploadResult && uploadResult.secure_url) {
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
    updateListingStatus,
    getMyListings,
};
