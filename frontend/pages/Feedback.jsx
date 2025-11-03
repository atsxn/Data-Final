import { useState } from "react";
import { getToken } from "../utils/auth";
import "../styles.css";

const API_BASE = "/api";

export default function Feedback() {
  const [t, setT] = useState("");
  const [info, setInfo] = useState("");

  async function send() {
    const text = t.trim();
    if (!text) return;

    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.success) {
        setT("");
        setInfo("ส่งแล้ว ✅");
      } else {
        setInfo(data.message || "ส่งไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      setInfo("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  }

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="home-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="text-primary" style={{ margin: 0 }}>
            Feedback
          </h2>
        </div>

        <div className="card">
          <textarea
            rows="4"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              resize: "vertical",
            }}
            value={t}
            onChange={(e) => setT(e.target.value)}
            placeholder="พิมพ์ข้อเสนอแนะที่นี่..."
          ></textarea>

          <div className="row" style={{ marginTop: "12px" }}>
            <button onClick={send}>ส่ง</button>
            <span className="muted">{info}</span>
          </div>
        </div>
      </div>
    </div>
  );
}