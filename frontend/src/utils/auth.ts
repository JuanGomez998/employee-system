import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "employee";
  employee_cedula?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Login user
 * @param username - Username
 * @param password - Password
 * @returns Token and user info
 */
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
    username,
    password,
  });
  return response.data;
};

/**
 * Get current authenticated user info
 * @param token - JWT token
 * @returns User information
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await axios.get<User>(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Store token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

/**
 * Retrieve token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem("auth_token");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Verify token is valid (decode without verification)
 * Note: This is a simple check. In production, verify signature on backend.
 */
export const decodeToken = (token: string): any => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null; // Token expired
    }
    
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
