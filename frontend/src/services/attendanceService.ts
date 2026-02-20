import { getToken } from "../utils/auth";

const API_URL = "http://localhost:3000/api/attendance";

const authHeaders = () => {
  const token = getToken();
  if (!token) {
    return {} as Record<string, string>;
  }

  return { Authorization: `Bearer ${token}` };
};

export const getStatus = async (cedula: string) => {
  const res = await fetch(`${API_URL}/status/${encodeURIComponent(cedula)}`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const checkIn = async (cedula: string) => {
  const res = await fetch(`${API_URL}/check-in/${encodeURIComponent(cedula)}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
};

export const checkOut = async (cedula: string) => {
  const res = await fetch(`${API_URL}/check-out/${encodeURIComponent(cedula)}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
};