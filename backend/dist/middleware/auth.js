"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request
 */
const authMiddleware = (req, res, next) => {
    const token = (0, jwt_1.extractToken)(req.headers.authorization);
    if (!token) {
        res.status(401).json({ message: "No authorization token provided" });
        return;
    }
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
    req.user = decoded;
    next();
};
exports.authMiddleware = authMiddleware;
/**
 * Admin-only middleware
 * Requires role: "admin"
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }
    if (req.user.role !== "admin") {
        res.status(403).json({
            message: "Access forbidden. Admin role required.",
        });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
/**
 * Optional authentication middleware
 * Adds user info if token exists, but doesn't require it
 */
const optionalAuthMiddleware = (req, res, next) => {
    const token = (0, jwt_1.extractToken)(req.headers.authorization);
    if (token) {
        const decoded = (0, jwt_1.verifyToken)(token);
        if (decoded) {
            req.user = decoded;
        }
    }
    next();
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
