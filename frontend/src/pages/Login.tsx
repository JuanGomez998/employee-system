import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "./Login.css";

interface LoginProps {
  isAuthenticated: boolean;
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export default function Login({ isAuthenticated, onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Username and password are required");
      return;
    }

    setLoading(true);

    try {
      const success = await onLogin(username.trim(), password.trim());

      if (success) {
        toast.success("Login successful");
        navigate("/admin/dashboard", { replace: true });
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Login failed";
        toast.error(message);
      } else {
        toast.error("Login failed");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🔐</div>
          <h1>Admin Login</h1>
          <p>Access the management dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
            autoComplete="username"
            disabled={loading}
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <span>Use admin credentials to manage the system.</span>
        </div>
      </div>
    </div>
  );
}
