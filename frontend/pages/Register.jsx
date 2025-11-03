import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../utils/auth";
import "../styles.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const res = await register(username, password, email);
    if (res.success) {
      nav("/");
    } else {
      setError(res.message || "สมัครสมาชิกไม่สำเร็จ");
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="home-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="text-primary" style={{ margin: 0 }}>
            สมัครสมาชิก
          </h2>
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              autoComplete="email"
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="confirm password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit">สมัครสมาชิก</button>

          <div className="login-bottom-text">
            <span>มีบัญชีแล้ว? </span>
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                nav("/login");
              }}
            >
              เข้าสู่ระบบ
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
