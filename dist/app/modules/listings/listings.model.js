"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const listingSchema = new mongoose_1.Schema({
    guide: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    itinerary: { type: String },
    city: { type: String, required: true },
    category: { type: String, required: true },
    fee: { type: Number, required: true },
    duration: { type: Number, required: true },
    meetingPoint: { type: String, required: true },
    maxGroupSize: { type: Number, required: true },
    images: [String],
    language: String,
    isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });
const Listing = (0, mongoose_1.model)("Listing", listingSchema);
exports.default = Listing;
