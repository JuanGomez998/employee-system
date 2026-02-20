import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import "./Clock.css";

interface ClockResponse {
  success: boolean;
  action?: "check_in" | "check_out" | "already_completed";
  message: string;
  data?: {
    employee: {
      cedula: string;
      name: string;
      position: string;
    };
    attendance: {
      id: number;
      check_in_time: string;
      check_out_time: string | null;
      total_hours?: number;
    };
    timestamp: string;
  };
}

export default function Clock() {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const controlKeys = useRef(
    new Set([
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
    ])
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePunch = async () => {
    const normalizedCedula = cedula.trim();

    if (!normalizedCedula) {
      toast.error("Please enter your cedula");
      return;
    }

    if (!/^\d+$/.test(normalizedCedula)) {
      toast.error("Cedula must contain numbers only");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post<ClockResponse>("http://localhost:3000/api/clock/punch", {
        cedula: normalizedCedula,
      });

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        toast.success(response.data.message);

        setCedula("");
        inputRef.current?.focus();

        console.log("Punch successful:", response.data.data);
      } else {
        toast.error(response.data.message);
        setCedula("");
        inputRef.current?.focus();
      }
    } catch (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Error processing attendance";
        toast.error(message);
      } else {
        toast.error("Network error. Please try again.");
      }

      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCedulaChange = (value: string) => {
    const sanitized = value.replace(/\D+/g, "");
    if (value !== sanitized) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      toast.error("Cedula must contain numbers only");
    }
    setCedula(sanitized);
  };

  const handleKeypadClick = (num: string) => {
    if (cedula.length < 20) {
      setCedula(cedula + num);
    }
  };

  const handleClear = () => {
    setCedula("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!controlKeys.current.has(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }
    if (event.key === "Enter") {
      handlePunch();
    } else if (event.key === "Backspace") {
      setCedula(cedula.slice(0, -1));
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={`clock-container ${showSuccess ? "flash-success" : ""} ${showError ? "shake-error" : ""}`}>
      {showSuccess && <div className="success-overlay">✓ Record registered!</div>}

      {showError && <div className="error-message">❌ Invalid cedula</div>}

      <div className="clock-header">
        <div className="logo">⏰</div>
        <h1>Employee Clock System</h1>
      </div>

      <div className="time-display">
        <div className="time">{formatTime(currentTime)}</div>
        <div className="date">{formatDate(currentTime)}</div>
      </div>

      <div className="clock-interface">
        <div className="input-section">
          <label htmlFor="employee-id">Enter your cedula</label>
          <input
            id="employee-id"
            ref={inputRef}
            type="text"
            placeholder="e.g., 100000001"
            value={cedula}
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={(event) => handleCedulaChange(event.target.value)}
            onKeyDown={handleKeyDown}
            className="employee-id-input"
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="keypad-section">
          <div className="keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                className="keypad-btn"
                onClick={() => handleKeypadClick(num.toString())}
                disabled={loading}
              >
                {num}
              </button>
            ))}
            <button
              className="keypad-btn keypad-special"
              onClick={() => handleKeypadClick("0")}
              disabled={loading}
            >
              0
            </button>
            <button
              className="keypad-btn keypad-special clear-btn"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>

        <button
          className="punch-btn"
          onClick={handlePunch}
          disabled={loading || !cedula.trim()}
        >
          {loading ? "Processing..." : "Check In / Check Out"}
        </button>
      </div>

      <div className="clock-footer">
        <p>🔒 Secure cedula required | For support, contact HR</p>
      </div>
    </div>
  );
}
