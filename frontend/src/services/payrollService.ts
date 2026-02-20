/**
 * Payroll Service - Frontend
 * Consumes payroll API and downloads the Excel file
 */

import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE_URL = "http://localhost:3000/api/payroll";

export interface PayrollRequest {
  startDate: string; // ISO format: YYYY-MM-DD
  endDate: string;
  employeeCedulas?: string[];
}

/**
 * Generates and downloads a payroll report in Excel
 * @param request Report payload (dates and employees)
 */
export async function downloadPayrollReport(request: PayrollRequest): Promise<void> {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/generate`, request, {
      responseType: "blob",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payroll_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading payroll report:", error);
    throw error;
  }
}
