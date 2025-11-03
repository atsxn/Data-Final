import { useState } from "react";

export default function Feedback(){
  const [t, setT] = useState("");
  const [info, setInfo] = useState("");

  function send(){
    if (!t.trim()) return;
    const all = JSON.parse(localStorage.getItem("pbi_feedback") || "[]");
    all.push({ text: t.trim(), at: new Date().toISOString() });
    localStorage.setItem("pbi_feedback", JSON.stringify(all));
    setT(""); setInfo("บันทึกแล้ว");
  }

  return (
  <div className="dashboard-container">
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* กล่องหัวข้อ */}
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
