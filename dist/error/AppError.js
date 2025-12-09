"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../app/config/env");
class AppError extends Error {
    constructor(statusCode, message, stack = "") {
        super(message);
        this.statusCode = statusCode;
        if (stack && env_1.envVars.NODE_ENV === "development") {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.default = AppError;
