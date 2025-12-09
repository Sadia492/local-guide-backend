"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerDuplicateError = void 0;
const handlerDuplicateError = (err) => {
    const response = {
        statusCode: 400,
        message: "Duplicate entry found",
        errorSources: [],
    };
    if (!err) {
        return response;
    }
    if (err.code === 11000) {
        let duplicateFields = [];
        let duplicateValues = [];
        if (err.keyValue && typeof err.keyValue === "object") {
            duplicateFields = Object.keys(err.keyValue);
            duplicateValues = Object.values(err.keyValue);
        }
        if (err.keyPattern && typeof err.keyPattern === "object") {
            duplicateFields = Object.keys(err.keyPattern);
        }
        if (duplicateFields.length === 0 && err.message) {
            const match = err.message.match(/index:\s+(\w+)_/);
            if (match) {
                duplicateFields = [match[1]];
            }
        }
        if (duplicateFields.length > 0) {
            if (duplicateFields.includes("listing") &&
                duplicateFields.includes("user")) {
                response.message =
                    "You have already reviewed this listing. Each user can only submit one review per listing.";
            }
            else if (duplicateFields.includes("email")) {
                response.message =
                    "This email is already registered. Please use a different email or login.";
            }
            else if (duplicateFields.length === 1) {
                const field = duplicateFields[0];
                const value = duplicateValues[0] || "";
                response.message = `The ${field} '${value}' is already in use. Please choose a different ${field}.`;
            }
            else {
                response.message = `Duplicate entry for fields: ${duplicateFields.join(", ")}`;
            }
        }
        duplicateFields.forEach((field, index) => {
            response.errorSources.push({
                path: field,
                message: `${field} must be unique`,
            });
        });
    }
    return response;
};
exports.handlerDuplicateError = handlerDuplicateError;
