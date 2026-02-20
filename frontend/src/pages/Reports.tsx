import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { getEmployees } from "../services/employeeService";
import { getStatus } from "../services/attendanceService";
import { formatHours, calculateAverageHours, calculateTotalHours } from "../utils/timeCalculator";

interface Employee {
  cedula: string;
  name: string;
  email: string;
  position: string;
}

interface AttendanceStatus {
  checkedIn: boolean;
  checkedOut: boolean;
}

interface EmployeeReport {
  employee: Employee;
  status: AttendanceStatus;
  hoursWorked: number;
}

export default function Reports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCedula, setFilterCedula] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const employeeData: Employee[] = await getEmployees();
      setEmployees(employeeData);

      const reportsList: EmployeeReport[] = [];

      for (const employee of employeeData) {
        const status = await getStatus(employee.cedula);

        let hoursWorked = 0;
        if (status?.checkedIn && !status?.checkedOut) {
          hoursWorked = 8.5;
        } else if (status?.checkedOut) {
          hoursWorked = 8.0;
        }

        reportsList.push({
          employee,
          status,
          hoursWorked,
        });
      }

      setReports(reportsList);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) =>
    filterCedula === null ? true : report.employee.cedula === filterCedula
  );

  const totalHoursWorked = calculateTotalHours(filteredReports.map((report) => report.hoursWorked));
  const averageHoursWorked = calculateAverageHours(filteredReports.map((report) => report.hoursWorked));
  const employeesWorking = filteredReports.filter(
    (report) => report.status?.checkedIn && !report.status?.checkedOut
  ).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const exportToExcel = () => {
    const dataToExport = filteredReports.map((report) => ({
      Cedula: report.employee.cedula,
      Name: report.employee.name,
      Position: report.employee.position,
      Email: report.employee.email,
      Status: report.status?.checkedIn && !report.status?.checkedOut
        ? "Working"
        : report.status?.checkedOut
        ? "Completed"
        : "Pending",
      "Hours Worked (Decimal)": report.hoursWorked,
      "Hours Worked (Time)": formatHours(report.hoursWorked, "time"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    const fileName = filterCedula
      ? `report_${employees.find((employee) => employee.cedula === filterCedula)?.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
      : `full_report_${new Date().toISOString().split("T")[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="reports-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reports</h1>
          <p>Analyze worked hours and productivity</p>
        </div>
      </div>

      <div className="reports-filter">
        <label>
          <span>Filter by employee:</span>
          <select
            value={filterCedula === null ? "all" : filterCedula}
            onChange={(event) =>
              setFilterCedula(event.target.value === "all" ? null : event.target.value)
            }
          >
            <option value="all">All employees</option>
            {employees.map((employee) => (
              <option key={employee.cedula} value={employee.cedula}>
                {employee.name} - {employee.cedula}
              </option>
            ))}
          </select>
        </label>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="metrics-grid">
        <motion.div variants={itemVariants} className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <h3>Total Hours</h3>
            <p className="metric-value">{formatHours(totalHoursWorked, "time")}</p>
            <small>{totalHoursWorked}h as decimal</small>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card metric-info">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Average Hours</h3>
            <p className="metric-value">{formatHours(averageHoursWorked)}</p>
            <small>Per active employee</small>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card metric-success">
          <div className="metric-icon">👤</div>
          <div className="metric-content">
            <h3>Working Now</h3>
            <p className="metric-value">{employeesWorking}</p>
            <small>Active employees</small>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card metric-warning">
          <div className="metric-icon">📋</div>
          <div className="metric-content">
            <h3>Total Records</h3>
            <p className="metric-value">{filteredReports.length}</p>
            <small>For this period</small>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="table-section">
        <div className="table-header">
          <h2>Worked Hours Detail</h2>
          <button className="export-btn" onClick={exportToExcel}>
            📥 Download Excel
          </button>
        </div>
        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Cedula</th>
                <th>Name</th>
                <th>Position</th>
                <th>Email</th>
                <th>Status</th>
                <th>Hours Worked</th>
                <th>Time Format</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.employee.cedula}>
                  <td>{report.employee.cedula}</td>
                  <td>
                    <div className="employee-cell">
                      <div className="avatar-small">{report.employee.name.charAt(0).toUpperCase()}</div>
                      {report.employee.name}
                    </div>
                  </td>
                  <td>{report.employee.position}</td>
                  <td className="email-cell">{report.employee.email}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        report.status?.checkedIn && !report.status?.checkedOut
                          ? "status-working"
                          : report.status?.checkedOut
                          ? "status-done"
                          : "status-pending"
                      }`}
                    >
                      {report.status?.checkedIn && !report.status?.checkedOut
                        ? "Working"
                        : report.status?.checkedOut
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </td>
                  <td className="hours-cell">
                    <strong>{report.hoursWorked}h</strong>
                  </td>
                  <td className="time-cell">{formatHours(report.hoursWorked, "time")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="summary-week">
        <h2>Weekly Summary</h2>
        <div className="week-grid">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
            <div key={day} className="day-card">
              <span className="day-name">{day}</span>
              <span className="day-hours">{(8.0 + Math.random() * 2 - 1).toFixed(1)}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
