import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getStatus, checkIn, checkOut } from "../services/attendanceService";
import {
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "../services/employeeService";

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

interface FormErrors {
  cedula?: string;
  name?: string;
  email?: string;
  position?: string;
}

const LETTERS_ONLY_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const LETTER_OR_SPACE_KEY_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]$/;
const CEDULA_REGEX = /^\d+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeCedula = (value: string) => value.replace(/\D+/g, "");
const sanitizeLettersAndSpaces = (value: string) => value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
const CONTROL_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Enter",
  "Dead",
]);

const isControlKey = (key: string) => CONTROL_KEYS.has(key);
const isDigitKey = (key: string) => /^\d$/.test(key);
const isLetterOrSpaceKey = (key: string) => LETTER_OR_SPACE_KEY_REGEX.test(key);

type SortField = "cedula" | "name" | "email" | "position" | "status";
type SortDirection = "asc" | "desc";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, AttendanceStatus>>({});

  const [search, setSearch] = useState("");
  const [cedula, setCedula] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [editingCedula, setEditingCedula] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 5;

  const loadEmployees = async () => {
    const data: Employee[] = await getEmployees();
    setEmployees(data);

    const statusMap: Record<string, AttendanceStatus> = {};
    for (const employee of data) {
      const status = await getStatus(employee.cedula);
      statusMap[employee.cedula] = status;
    }
    setAttendanceStatus(statusMap);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openCreateModal = () => {
    setEditingCedula(null);
    setCedula("");
    setName("");
    setEmail("");
    setPosition("");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setCedula(employee.cedula);
    setName(employee.name);
    setEmail(employee.email);
    setPosition(employee.position);
    setEditingCedula(employee.cedula);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    const trimmedCedula = cedula.trim();
    const normalizedName = name.trim().replace(/\s+/g, " ");
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPosition = position.trim().replace(/\s+/g, " ");

    if (!trimmedCedula) {
      nextErrors.cedula = "Cedula is required";
    } else if (!CEDULA_REGEX.test(trimmedCedula)) {
      nextErrors.cedula = "Cedula must contain numbers only";
    }

    if (!normalizedName) {
      nextErrors.name = "Name is required";
    } else if (!LETTERS_ONLY_REGEX.test(normalizedName)) {
      nextErrors.name = "Name must contain letters only";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email";
    }

    if (!normalizedPosition) {
      nextErrors.position = "Position is required";
    } else if (!LETTERS_ONLY_REGEX.test(normalizedPosition)) {
      nextErrors.position = "Position must contain letters only";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isFormValid =
    CEDULA_REGEX.test(cedula.trim()) &&
    LETTERS_ONLY_REGEX.test(name.trim()) &&
    LETTERS_ONLY_REGEX.test(position.trim()) &&
    EMAIL_REGEX.test(email.trim().toLowerCase());

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      if (editingCedula !== null) {
        await updateEmployee(editingCedula, {
          name: name.trim().replace(/\s+/g, " "),
          email: email.trim().toLowerCase(),
          position: position.trim().replace(/\s+/g, " "),
        });
        toast.success("Employee updated");
      } else {
        await createEmployee({
          cedula: cedula.trim(),
          name: name.trim().replace(/\s+/g, " "),
          email: email.trim().toLowerCase(),
          position: position.trim().replace(/\s+/g, " "),
        });
        toast.success("Employee created");
      }

      closeModal();
      loadEmployees();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Error saving employee";
      toast.error(message);
    }
  };

  const handleDelete = async (employeeCedula: string) => {
    try {
      await deleteEmployee(employeeCedula);
      toast.success("Employee deleted");
      loadEmployees();
    } catch {
      toast.error("Error deleting employee");
    }
  };

  const handleCheckIn = async (employeeCedula: string) => {
    try {
      await checkIn(employeeCedula);
      toast.success("Checked in");
      loadEmployees();
    } catch (error: any) {
      toast.error(error.message || "Error checking in");
    }
  };

  const handleCheckOut = async (employeeCedula: string) => {
    try {
      await checkOut(employeeCedula);
      toast.success("Checked out");
      loadEmployees();
    } catch (error: any) {
      toast.error(error.message || "Error checking out");
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const lowerSearch = search.toLowerCase();
    return (
      employee.name.toLowerCase().includes(lowerSearch) ||
      employee.cedula.toLowerCase().includes(lowerSearch)
    );
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const sortedEmployees = useMemo(() => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    return [...filteredEmployees].sort((a, b) => {
      if (sortField === "status") {
        const aStatus = attendanceStatus[a.cedula];
        const bStatus = attendanceStatus[b.cedula];

        const rankStatus = (status?: AttendanceStatus) => {
          if (status?.checkedIn && !status?.checkedOut) return 2;
          if (status?.checkedOut) return 1;
          return 0;
        };

        return (rankStatus(aStatus) - rankStatus(bStatus)) * multiplier;
      }

      return a[sortField].localeCompare(b[sortField]) * multiplier;
    });
  }, [filteredEmployees, sortDirection, sortField, attendanceStatus]);

  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / PAGE_SIZE));

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedEmployees.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedEmployees]);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getBadge = (status?: AttendanceStatus) => {
    if (status?.checkedIn && !status?.checkedOut) {
      return <span className="badge active">🟢 Active</span>;
    }

    if (status?.checkedOut) {
      return <span className="badge inactive">🔴 Inactive</span>;
    }

    return <span className="badge break">🟡 Pending</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="employees-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Employees</h1>
          <p>Manage your team, attendance, and performance</p>
        </div>

        <div className="page-header-right">
          <button className="primary-btn" onClick={openCreateModal}>
            + New Employee
          </button>
        </div>
      </div>

      <div className="kpi-container">
        <div className="kpi-card">
          <h3>Total Employees</h3>
          <p>{employees.length}</p>
        </div>

        <div className="kpi-card">
          <h3>On Site</h3>
          <p>
            {
              Object.values(attendanceStatus).filter(
                (status) => status?.checkedIn && !status?.checkedOut
              ).length
            }
          </p>
        </div>

        <div className="kpi-card">
          <h3>Checked Out</h3>
          <p>{Object.values(attendanceStatus).filter((status) => status?.checkedOut).length}</p>
        </div>
      </div>

      <div className="actions-bar">
        <input
          className="search-input"
          placeholder="Search by name or cedula..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="employees-table">
            <thead>
              <tr>
                <th>
                  <button className="th-button" onClick={() => handleSort("cedula")}>
                    Cedula <span>{getSortIndicator("cedula")}</span>
                  </button>
                </th>
                <th>
                  <button className="th-button" onClick={() => handleSort("name")}>
                    Employee <span>{getSortIndicator("name")}</span>
                  </button>
                </th>
                <th>
                  <button className="th-button" onClick={() => handleSort("email")}>
                    Email <span>{getSortIndicator("email")}</span>
                  </button>
                </th>
                <th>
                  <button className="th-button" onClick={() => handleSort("position")}>
                    Position <span>{getSortIndicator("position")}</span>
                  </button>
                </th>
                <th>
                  <button className="th-button" onClick={() => handleSort("status")}>
                    Status <span>{getSortIndicator("status")}</span>
                  </button>
                </th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={7}>
                    <div className="empty-state">
                      <strong>No results</strong>
                      <span>No employees match your search.</span>
                    </div>
                  </td>
                </tr>
              )}

              <AnimatePresence initial={false}>
                {paginatedEmployees.map((employee) => {
                  const status = attendanceStatus[employee.cedula];

                  return (
                    <motion.tr
                      key={employee.cedula}
                      className="table-row"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td>{employee.cedula}</td>

                      <td>
                        <div className="employee-name">
                          <div className="avatar">{employee.name.charAt(0).toUpperCase()}</div>
                          <span>{employee.name}</span>
                        </div>
                      </td>

                      <td>{employee.email}</td>
                      <td>{employee.position}</td>
                      <td>{getBadge(status)}</td>

                      <td className="attendance-cell">
                        {!status?.checkedIn && (
                          <button className="checkin" onClick={() => handleCheckIn(employee.cedula)}>
                            Check In
                          </button>
                        )}

                        {status?.checkedIn && !status?.checkedOut && (
                          <button className="checkout" onClick={() => handleCheckOut(employee.cedula)}>
                            Check Out
                          </button>
                        )}

                        {status?.checkedOut && <span className="attendance-complete">Completed</span>}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button className="edit" onClick={() => openEditModal(employee)}>
                            Edit
                          </button>

                          <button className="delete" onClick={() => handleDelete(employee.cedula)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span className="table-summary">
            Showing {paginatedEmployees.length} of {sortedEmployees.length} employees
          </span>

          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                className={`page-btn ${pageNumber === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            <div className="modal-container">
              <motion.div
                className="modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.22 }}
              >
                <div className="modal-header">
                  <div>
                    <h2 className="modal-title">
                      {editingCedula !== null ? "Edit Employee" : "Create New Employee"}
                    </h2>
                    <p className="modal-subtitle">Enter employee details to save the record.</p>
                  </div>

                  <button className="modal-close" onClick={closeModal}>
                    ✕
                  </button>
                </div>

                <div className="modal-form">
                  <label className="form-field">
                    <span>Cedula</span>
                    <input
                      className={formErrors.cedula ? "input-error" : ""}
                      type="text"
                      placeholder="e.g. 100000001"
                      value={cedula}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={20}
                      disabled={editingCedula !== null}
                      onChange={(event) => {
                        const rawValue = event.target.value;
                        const sanitized = sanitizeCedula(rawValue);
                        const hasInvalid = rawValue !== sanitized;
                        setCedula(sanitized);
                        if (hasInvalid) {
                          setFormErrors((previous) => ({
                            ...previous,
                            cedula: "Cedula must contain numbers only",
                          }));
                        } else if (formErrors.cedula) {
                          setFormErrors((previous) => ({ ...previous, cedula: undefined }));
                        }
                      }}
                      onKeyDown={(event) => {
                        if (!isControlKey(event.key) && !isDigitKey(event.key)) {
                          event.preventDefault();
                        }
                      }}
                    />
                    {formErrors.cedula && <small className="field-error">{formErrors.cedula}</small>}
                  </label>

                  <label className="form-field">
                    <span>Name</span>
                    <input
                      className={formErrors.name ? "input-error" : ""}
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(event) => {
                        setName(sanitizeLettersAndSpaces(event.target.value));
                        if (formErrors.name) {
                          setFormErrors((previous) => ({ ...previous, name: undefined }));
                        }
                      }}
                      onKeyDown={(event) => {
                        if (!isControlKey(event.key) && !isLetterOrSpaceKey(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onBlur={() => {
                        setName((previous) => previous.trim().replace(/\s+/g, " "));
                      }}
                    />
                    {formErrors.name && <small className="field-error">{formErrors.name}</small>}
                  </label>

                  <label className="form-field">
                    <span>Email</span>
                    <input
                      className={formErrors.email ? "input-error" : ""}
                      type="email"
                      placeholder="example@company.com"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (formErrors.email) {
                          setFormErrors((previous) => ({ ...previous, email: undefined }));
                        }
                      }}
                      onBlur={() => {
                        setEmail((previous) => previous.trim().toLowerCase());
                      }}
                    />
                    {formErrors.email && <small className="field-error">{formErrors.email}</small>}
                  </label>

                  <label className="form-field">
                    <span>Position</span>
                    <input
                      className={formErrors.position ? "input-error" : ""}
                      type="text"
                      placeholder="e.g. UI Designer"
                      value={position}
                      onChange={(event) => {
                        setPosition(sanitizeLettersAndSpaces(event.target.value));
                        if (formErrors.position) {
                          setFormErrors((previous) => ({ ...previous, position: undefined }));
                        }
                      }}
                      onKeyDown={(event) => {
                        if (!isControlKey(event.key) && !isLetterOrSpaceKey(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onBlur={() => {
                        setPosition((previous) => previous.trim().replace(/\s+/g, " "));
                      }}
                    />
                    {formErrors.position && <small className="field-error">{formErrors.position}</small>}
                  </label>
                </div>

                <div className="modal-actions">
                  <button className="cancel" onClick={closeModal}>
                    Cancel
                  </button>

                  <button className="save" onClick={handleSubmit} disabled={!isFormValid}>
                    {editingCedula !== null ? "Update" : "Create Employee"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
