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
exports.MetaController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const meta_service_1 = require("./meta.service");
const getDashboardStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Authentication required",
            data: null,
        });
    }
    const metaData = yield meta_service_1.MetaService.fetchDashboardMetaData(user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: metaData,
    });
}));
const getAdminDashboardStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const metaData = yield meta_service_1.MetaService.getAdminMetaData();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Admin dashboard statistics retrieved successfully",
        data: metaData,
    });
}));
const getChartData = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { timeframe = "monthly" } = req.query;
    const [barChartData, pieChartData] = yield Promise.all([
        meta_service_1.MetaService.getBarChartData(timeframe),
        meta_service_1.MetaService.getPieChartData(),
    ]);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chart data retrieved successfully",
        data: {
            barChartData,
            pieChartData,
        },
    });
}));
exports.MetaController = {
    getDashboardStats,
    getAdminDashboardStats,
    getChartData,
};
