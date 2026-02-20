"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const TOKEN_EXPIRY = "24h";
/**
 * Generate JWT token for user
 * @param payload - User data to encode
 * @returns Signed JWT token
 */
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, {
        expiresIn: TOKEN_EXPIRY,
    });
};
exports.generateToken = generateToken;
/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        return decoded;
    }
    catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
};
exports.verifyToken = verifyToken;
/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token without "Bearer " prefix
 */
const extractToken = (authHeader) => {
    if (!authHeader)
        return null;
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }
    return parts[1];
};
exports.extractToken = extractToken;
