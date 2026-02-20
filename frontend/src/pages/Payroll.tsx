import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { downloadPayrollReport } from "../services/payrollService";
import { getEmployees } from "../services/employeeService";
import toast from "react-hot-toast";

interface Employee {
  cedula: string;
  name: string;
  email: string;
  position: string;
}

export default function Payroll() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedEmployeeCedulas, setSelectedEmployeeCedulas] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Error loading employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = (cedula: string) => {
    setSelectedEmployeeCedulas((previous) =>
      previous.includes(cedula)
        ? previous.filter((item) => item !== cedula)
        : [...previous, cedula]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployeeCedulas([]);
    } else {
      setSelectedEmployeeCedulas(employees.map((employee) => employee.cedula));
    }
    setSelectAll(!selectAll);
  };

  const handleGeneratePayroll = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select valid dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be later than end date");
      return;
    }

    setGenerating(true);
    try {
      await downloadPayrollReport({
        startDate,
        endDate,
        employeeCedulas:
          selectedEmployeeCedulas.length > 0 ? selectedEmployeeCedulas : undefined,
      });
      toast.success("Payroll report downloaded successfully");
    } catch (error) {
      console.error("Error generating payroll:", error);
      toast.error("Error generating payroll report");
    } finally {
      setGenerating(false);
    }
  };

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="payroll-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Payroll</h1>
          <p>Generate payroll reports based on Colombian labor rules</p>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="payroll-filters">
        <motion.div variants={itemVariants} className="filter-group">
          <label>
            <span className="label-text">Start Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="date-input"
            />
          </label>
        </motion.div>

        <motion.div variants={itemVariants} className="filter-group">
          <label>
            <span className="label-text">End Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="date-input"
            />
          </label>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="employees-selection">
        <div className="selection-header">
          <h2>Select Employees</h2>
          <button className={`select-all-btn ${selectAll ? "active" : ""}`} onClick={handleSelectAll}>
            {selectAll ? "Deselect All" : "Select All"}
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : (
          <div className="employees-grid">
            {employees.map((employee) => (
              <label
                key={employee.cedula}
                className={`employee-checkbox ${
                  selectedEmployeeCedulas.includes(employee.cedula) ? "selected" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedEmployeeCedulas.includes(employee.cedula)}
                  onChange={() => handleSelectEmployee(employee.cedula)}
                />
                <div className="checkbox-label">
                  <span className="employee-name">{employee.name}</span>
                  <span className="employee-position">{employee.position}</span>
                  <small>{employee.cedula}</small>
                </div>
              </label>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="payroll-info">
        <div className="info-card">
          <h3>📋 What the report includes</h3>
          <ul>
            <li>✓ Normal, overtime daytime, and overtime nighttime hours</li>
            <li>✓ Night surcharge (35%)</li>
            <li>✓ Sunday surcharge (75%)</li>
            <li>✓ Holiday surcharge (100%)</li>
            <li>✓ Legal bonus, severance, and proportional vacation</li>
            <li>✓ Transport allowance</li>
            <li>✓ Full total payment</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>📊 Excel structure</h3>
          <ul>
            <li>🗂️ Sheet 1: Global summary by employee</li>
            <li>📝 Sheet 2: Detailed employee breakdown</li>
            <li>📈 Sheet 3: Comparative analysis</li>
          </ul>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="payroll-action">
        <button className="generate-btn" onClick={handleGeneratePayroll} disabled={generating}>
          {generating ? "Generating... ⏳" : "📥 Generate Payroll"}
        </button>

        {selectedEmployeeCedulas.length > 0 && (
          <p className="selection-info">
            {selectedEmployeeCedulas.length} employee{selectedEmployeeCedulas.length !== 1 ? "s" : ""} selected
          </p>
        )}

        {selectedEmployeeCedulas.length === 0 && (
          <p className="selection-info info-text">No selection means all employees will be included</p>
        )}
      </motion.div>
    </motion.div>
  );
}
