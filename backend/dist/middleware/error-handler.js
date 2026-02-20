"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const app_error_1 = require("../core/app-error");
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
        const validationError = new app_error_1.ValidationError("Invalid request payload", error.flatten());
        res.status(validationError.statusCode).json({
            message: validationError.message,
            code: validationError.code,
            details: validationError.details,
        });
        return;
    }
    if (error instanceof app_error_1.AppError) {
        res.status(error.statusCode).json({
            message: error.message,
            code: error.code,
            details: error.details,
        });
        return;
    }
    console.error(error);
    res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
    });
};
exports.errorHandler = errorHandler;
