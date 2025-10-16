import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../utils/auth";
import "../styles.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username || !password || !email) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const result = await register(username, password, email);

    if (result.success) {
      alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      nav("/login");
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* ส่วนหัว */}
        <div className="home-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="text-primary" style={{ margin: 0 }}>
            สมัครสมาชิก
          </h2>
        </div>

        {/* ฟอร์มสมัครสมาชิก */}
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
              placeholder="ชื่อผู้ใช้"
              autoComplete="username"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="อีเมล"
              autoComplete="email"
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ยืนยันรหัสผ่าน"
              autoComplete="new-password"
            />
          </div>

          <button type="submit">สมัครสมาชิก</button>

          <div className="login-bottom-text">
            <span>มีบัญชีอยู่แล้ว? </span>
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
