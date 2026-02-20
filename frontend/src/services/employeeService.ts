import axios from "axios";
import { getToken } from "../utils/auth";

const API = "http://localhost:3000/api/employees";

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getEmployees = async () => {
  const response = await axios.get(API, {
    headers: authHeaders(),
  });
  return response.data;
};

export const createEmployee = async (data: {
  cedula: string;
  name: string;
  email: string;
  position: string;
}) => {
  const response = await axios.post(API, data, {
    headers: authHeaders(),
  });
  return response.data;
};

export const deleteEmployee = async (cedula: string) => {
  await axios.delete(`${API}/${encodeURIComponent(cedula)}`, {
    headers: authHeaders(),
  });
};

export const updateEmployee = async (
  cedula: string,
  data: { name: string; email: string; position: string }
) => {
  const response = await axios.put(`${API}/${encodeURIComponent(cedula)}`, data, {
    headers: authHeaders(),
  });
  return response.data;
};