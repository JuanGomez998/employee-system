import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getEmployees } from "../services/employeeService";
import { getStatus } from "../services/attendanceService";

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

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const employeeData: Employee[] = await getEmployees();
      setEmployees(employeeData);

      const statusMap: Record<string, AttendanceStatus> = {};
      for (const employee of employeeData) {
        const status = await getStatus(employee.cedula);
        statusMap[employee.cedula] = status;
      }
      setAttendanceStatus(statusMap);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = employees.length;
  const presentToday = Object.values(attendanceStatus).filter(
    (status) => status?.checkedIn && !status?.checkedOut
  ).length;
  const absentToday = totalEmployees - presentToday;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
  const checkedOutCount = Object.values(attendanceStatus).filter(
    (status) => status?.checkedOut
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading metrics...</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Daily activity and attendance overview</p>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="metrics-grid">
        <motion.div variants={itemVariants} className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Total Employees</h3>
            <p className="metric-value">{totalEmployees}</p>
            <small>Active in system</small>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card metric-success">
          <div className="metric-icon">✓</div>
          <div className="metric-content">
            <h3>Present Today</h3>
            <p className="metric-value">{presentToday}</p>
            <small>{attendanceRate}% attendance</small>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card metric-warning">
          <div className="metric-icon">✕</div>
          <div className="metric-content">
            <h3>Absent Today</h3>
            <p className="metric-value">{absentToday}</p>
            <small>{100 - attendanceRate}% absence</small>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card metric-info">
          <div className="metric-icon">🚪</div>
          <div className="metric-content">
            <h3>Checked Out</h3>
            <p className="metric-value">{checkedOutCount}</p>
            <small>Shift completed</small>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="chart-section">
        <h2>Attendance Distribution</h2>
        <div className="attendance-chart">
          <div className="chart-bar">
            <div className="chart-fill success" style={{ width: `${attendanceRate}%` }} />
            <span>{presentToday} present</span>
          </div>
          <div className="chart-bar">
            <div className="chart-fill warning" style={{ width: `${100 - attendanceRate}%` }} />
            <span>{absentToday} absent</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="activity-section">
        <h2>Latest Records</h2>
        <div className="activity-list">
          {employees.slice(0, 5).map((employee) => {
            const status = attendanceStatus[employee.cedula];
            const statusText = status?.checkedIn && !status?.checkedOut
              ? "✓ On Site"
              : status?.checkedOut
              ? "✕ Completed"
              : "⏳ Pending";
            const statusClass = status?.checkedIn && !status?.checkedOut
              ? "status-active"
              : status?.checkedOut
              ? "status-inactive"
              : "status-pending";

            return (
              <div key={employee.cedula} className="activity-item">
                <div className="activity-avatar">{employee.name.charAt(0).toUpperCase()}</div>
                <div className="activity-info">
                  <strong>{employee.name}</strong>
                  <small>{employee.position}</small>
                </div>
                <div className={`activity-status ${statusClass}`}>{statusText}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="summary-section">
        <h2>Daily Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Attendance Rate</span>
            <span className="summary-value">{attendanceRate}%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Average Employees</span>
            <span className="summary-value">{Math.round(totalEmployees * 0.75)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Peak Hour</span>
            <span className="summary-value">09:00 AM</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Last Update</span>
            <span className="summary-value">{new Date().toLocaleTimeString("es-CO", { hour12: false })}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
