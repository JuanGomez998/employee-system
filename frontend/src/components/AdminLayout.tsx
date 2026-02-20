import { useMemo } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onLogout: () => void;
  userName?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  desc: string;
  path: string;
}

/**
 * AdminLayout Component
 * 
 * Main layout for authenticated admin users.
 * Includes sidebar navigation, header, and footer.
 * The clock interface does NOT use this layout.
 */
export const AdminLayout = ({
  children,
  darkMode,
  setDarkMode,
  onLogout,
  userName,
}: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = useMemo(() => [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      desc: "General overview",
      path: "/admin/dashboard",
    },
    {
      id: "employees",
      label: "Employees",
      icon: "👥",
      desc: "Employee management",
      path: "/admin/employees",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "📄",
      desc: "KPIs and exports",
      path: "/admin/reports",
    },
    {
      id: "payroll",
      label: "Payroll",
      icon: "💰",
      desc: "Payroll settlement",
      path: "/admin/payroll",
    },
  ], []);

  const isItemActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={darkMode ? "" : "light"}>
      <div className="layout">
        {/* HEADER */}
        <header className="header">
          <h1>Employee Management</h1>

          <div className="header-right">
            {userName && <span className="header-user">Welcome, {userName}</span>}
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle dark/light mode"
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button
              className="logout-btn"
              onClick={onLogout}
              title="Sign out and return to clock"
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-title">Admin Menu</div>

          <nav>
            <ul>
              {navItems.map((item) => (
                <li
                  key={item.id}
                  className={`sidebar-item ${isItemActive(item.path) ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.desc}</small>
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sidebar-bottom">
            <span className="sidebar-dot" />
            System active
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">{children}</main>

        {/* FOOTER */}
        <footer className="footer">
          <p>Developed by Juan Gómez © 2026</p>
          <p>Contact: juan@email.com</p>
        </footer>
      </div>
    </div>
  );
};
