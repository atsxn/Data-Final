import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../utils/auth"; 
import "../styles.css";

export default function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(u, p);

    if (result.success) {
      localStorage.setItem("auth", "true");
      nav("/"); 
    } else {
      setError(result.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="home-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="text-primary" style={{ margin: 0 }}>เข้าสู่ระบบ</h2>
        </div>

        <form className="card login-form" onSubmit={onSubmit}>
          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                borderRadius: "8px",
                color: "#c33",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label>Username</label>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="username"
              autoComplete="username"
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit">Login</button>

          <div className="login-bottom-text">
            <span>ยังไม่มีบัญชี? </span>
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                nav("/register");
              }}
            >
              สมัครสมาชิก
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}