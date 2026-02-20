"use strict";
/**
 * Payroll Controller
 * Handles payroll report requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePayrollReport = generatePayrollReport;
const payrollService_1 = require("../services/payrollService");
const excelPayrollGenerator_1 = require("../services/excelPayrollGenerator");
/**
 * Generates and downloads payroll report in Excel format
 * POST /api/payroll/generate
 *
 * Body:
 * {
 *   startDate: string (ISO format)
 *   endDate: string (ISO format)
 *   employeeCedulas?: string[] (optional)
 * }
 */
async function generatePayrollReport(req, res) {
    try {
        const { startDate, endDate, employeeCedulas } = req.body;
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: "startDate and endDate are required",
            });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const mockPayrolls = generateMockPayrolls(start, end, employeeCedulas);
        const excelBuffer = await (0, excelPayrollGenerator_1.generatePayrollExcel)(mockPayrolls, "Employee System");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=payroll_${new Date().toISOString().split("T")[0]}.xlsx`);
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error generating payroll report:", error);
        res.status(500).json({ error: "Error generating report" });
    }
}
/**
 * Generates mock data for demo purposes
 */
function generateMockPayrolls(startDate, endDate, employeeCedulas) {
    const employees = [
        { cedula: "100000001", name: "John Perez", salary: 2000000 },
        { cedula: "100000002", name: "Maria Garcia", salary: 2500000 },
        { cedula: "100000003", name: "Carlos Lopez", salary: 1800000 },
    ];
    const normalizedCedulas = employeeCedulas?.map((item) => item.trim().toUpperCase());
    const filteredEmployees = normalizedCedulas && normalizedCedulas.length > 0
        ? employees.filter((employee) => normalizedCedulas.includes(employee.cedula))
        : employees;
    return filteredEmployees.map((emp) => {
        const dayRecords = [];
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const currentDay = new Date(date);
            const dayOfWeek = currentDay.getDay();
            if (dayOfWeek !== 0) {
                const checkIn = new Date(currentDay);
                checkIn.setHours(8, 0, 0);
                const checkOut = new Date(currentDay);
                checkOut.setHours(17, 0, 0);
                dayRecords.push({
                    date: currentDay,
                    dayOfWeek,
                    checkIn,
                    checkOut,
                    isHoliday: false,
                    isSunday: dayOfWeek === 0,
                });
            }
        }
        return (0, payrollService_1.calculatePayroll)(emp.cedula, emp.name, emp.salary, dayRecords, startDate, endDate);
    });
}
