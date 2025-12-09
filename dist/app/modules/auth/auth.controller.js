"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../../utils/catchAsync");
const auth_service_1 = require("./auth.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const env_1 = require("../../config/env");
const registerUser = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const result = yield auth_service_1.authService.registerUser(req);
      // Set cookies
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: "none",
      });
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: "none",
      });
      (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  });
exports.registerUser = registerUser;
const loginUser = (0, catchAsync_1.catchAsync)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const data = yield auth_service_1.authService.loginUser(payload);
    // For production: use 'none' and secure: true
    const isProduction = env_1.envVars.NODE_ENV === "production";
    // Set cookies with proper domain for cross-domain usage
    //   res.cookie("accessToken", data.accessToken, {
    //     httpOnly: true,
    //     secure: envVars.NODE_ENV === "production",
    //     sameSite: "none",
    //   });
    //   res.cookie("refreshToken", data.refreshToken, {
    //     httpOnly: true,
    //     secure: envVars.NODE_ENV === "production",
    //     sameSite: "none",
    //   });
    res.cookie("accessToken", data.accessToken, {
      secure: env_1.envVars.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: "none", // Change to 'lax' for local development
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", data.refreshToken, {
      secure: env_1.envVars.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: "none", // Change to 'lax' for local development
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    (0, sendResponse_1.sendResponse)(res, {
      statusCode: http_status_1.default.OK,
      success: true,
      message: "User Login Successfully",
      data,
    });
  })
);
exports.loginUser = loginUser;
const logoutUser = (0, catchAsync_1.catchAsync)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: env_1.envVars.NODE_ENV === "production",
      sameSite: "none", // Change to 'lax' for local development
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env_1.envVars.NODE_ENV === "production",
      sameSite: "none", // Change to 'lax' for local development
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    (0, sendResponse_1.sendResponse)(res, {
      statusCode: 200,
      success: true,
      message: "Logout successfully",
      data: null,
    });
  })
);
exports.logoutUser = logoutUser;
