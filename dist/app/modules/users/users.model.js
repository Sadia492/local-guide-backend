"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const users_interface_1 = require("./users.interface");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        trim: true,
        maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: Object.values(users_interface_1.Role),
        default: users_interface_1.Role.TOURIST,
    },
    profilePicture: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    languages: [
        {
            type: String,
        },
    ],
    expertise: [
        {
            type: String,
        },
    ],
    dailyRate: {
        type: Number,
        min: 0,
    },
    travelPreferences: [
        {
            type: String,
        },
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
