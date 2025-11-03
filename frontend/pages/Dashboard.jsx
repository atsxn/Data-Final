import { useState, useEffect, useMemo } from "react";
import { REPORTS } from "../utils/powerbi";
import {
  Search,
  Filter,
  Calendar,
  Star,
  Clock,
  Share2,
  Copy,
  Link2,
  Mail,
  FileDown,
} from "lucide-react";
import { getToken } from "../utils/auth";
import "../styles.css";

const API_BASE = "http://127.0.0.1:5000";

export default function Dashboard() {
  const allReports = useMemo(() => {
    return Object.entries(REPORTS).map(([code, r]) => ({ code, ...r }));
  }, []);

  const [reportKey, setReportKey] = useState(allReports.length ? allReports[0].code : "");
  const [favorites, setFavorites] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const currentReport =
    allReports.find((r) => r.code === reportKey) || allReports[0] || null;

  const categories = ["All", ...new Set(allReports.map((r) => r.category))];

  // โหลด favorites / history จาก backend
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // favorites
    fetch(`${API_BASE}/api/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setFavorites(data.favorites);
      });

    // history
    fetch(`${API_BASE}/api/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRecentViews(data.history);
      });
  }, []);

  // เมื่อเปลี่ยน report → บันทึก history
  useEffect(() => {
    if (!reportKey) return;
    const token = getToken();
    if (!token) return;

    fetch(`${API_BASE}/api/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ report_code: reportKey }),
    }).then(() => {
      // reload history
      fetch(`${API_BASE}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setRecentViews(data.history);
        });
    });
  }, [reportKey]);

  const toggleFavorite = async (code) => {
    const token = getToken();
    if (!token) return;
    const isFav = favorites.includes(code);

    if (isFav) {
      await fetch(`${API_BASE}/api/favorites/${code}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await fetch(`${API_BASE}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ report_code: code }),
      });
    }

    // reload
    const res = await fetch(`${API_BASE}/api/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setFavorites(data.favorites);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href + "?report=" + reportKey);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareViaEmail = () => {
    if (!currentReport) return;
    const subject = encodeURIComponent(`แชร์รายงาน: ${currentReport.name}`);
    const body = encodeURIComponent(
      `ดูรายงาน ${currentReport.name} ได้ที่: ${window.location.href}?report=${reportKey}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // filter บน frontend
  const filteredReports = allReports.filter((report) => {
    const matchSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "All" || report.category === selectedCategory;

    let matchDate = true;
    if (dateRange.start) {
      matchDate =
        matchDate &&
        new Date(report.published_at) >= new Date(dateRange.start + "T00:00:00");
    }
    if (dateRange.end) {
      matchDate =
        matchDate &&
        new Date(report.published_at) <= new Date(dateRange.end + "T23:59:59");
    }

    return matchSearch && matchCategory && matchDate;
  });

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
          <h1 className="text-primary" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            📊 Power BI Dashboard
          </h1>
          <p className="text-secondary">จัดการและวิเคราะห์รายงานของคุณ</p>
        </div>

        {/* filters */}
        <div className="dashboard-card-sm" style={{ marginBottom: "1.5rem" }}>
          <div className="row" style={{ gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* search */}
            <div style={{ flex: "1", minWidth: "250px", position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#a0aec0",
                }}
                size={20}
              />
              <input
                type="text"
                placeholder="ค้นหารายงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "45px" }}
              />
            </div>

            {/* category */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={20} style={{ color: "#667eea" }} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select-field"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* date */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={20} style={{ color: "#667eea" }} />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="input-field"
              />
              <span className="text-secondary">ถึง</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" }}>
          {/* sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* favorites */}
            <div className="dashboard-card-sm">
              <h3 className="text-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                รายการโปรด
              </h3>
              {favorites.length === 0 ? (
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                  ยังไม่มีรายการโปรด
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {favorites.map((code) => {
                    const r = allReports.find((x) => x.code === code);
                    if (!r) return null;
                    return (
                      <button
                        key={code}
                        onClick={() => setReportKey(code)}
                        className={`sidebar-item ${reportKey === code ? "active" : ""}`}
                      >
                        <div className="text-primary" style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                          {r.name}
                        </div>
                        <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
                          {r.category}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* recent views */}
            <div className="dashboard-card-sm">
              <h3 className="text-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={20} color="#667eea" />
                ดูล่าสุด
              </h3>
              {recentViews.length === 0 ? (
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                  ยังไม่มีประวัติ
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {recentViews.map((view, idx) => {
                    const r = allReports.find((x) => x.code === view.report_code);
                    return (
                      <button
                        key={idx}
                        onClick={() => setReportKey(view.report_code)}
                        className="sidebar-item"
                      >
                        <div className="text-primary" style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                          {r ? r.name : view.report_code}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                          {new Date(view.viewed_at).toLocaleString("th-TH")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* list reports */}
            <div className="dashboard-card-sm">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="text-primary">เลือกรายงาน</h3>
                {currentReport && (
                  <button
                    onClick={() => toggleFavorite(currentReport.code)}
                    className={`favorite-button ${
                      favorites.includes(currentReport.code) ? "active" : "inactive"
                    }`}
                  >
                    <Star
                      size={16}
                      fill={favorites.includes(currentReport.code) ? "#fbbf24" : "white"}
                      color={favorites.includes(currentReport.code) ? "none" : "white"}
                    />
                    <span>
                      {favorites.includes(currentReport.code) ? "ลบออกจากโปรด" : "เพิ่มในรายการโปรด"}
                    </span>
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem",
                }}
              >
                {filteredReports.map((report) => (
                  <button
                    key={report.code}
                    onClick={() => setReportKey(report.code)}
                    className={`report-card ${reportKey === report.code ? "active" : ""}`}
                  >
                    <div className={reportKey === report.code ? "" : "text-primary"}>{report.name}</div>
                    <div className={reportKey === report.code ? "" : "text-secondary"}>
                      {report.description}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: reportKey === report.code ? "rgba(255,255,255,0.2)" : "#f7fafc",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: reportKey === report.code ? "white" : "#667eea",
                      }}
                    >
                      {report.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* report viewer */}
            <div className="dashboard-card-sm">
              {currentReport ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 className="text-primary">{currentReport.name}</h2>
                      <p className="text-secondary">{currentReport.description}</p>
                      <p className="text-muted">
                        เผยแพร่บนเว็บ:{" "}
                        {currentReport.published_at
                          ? new Date(currentReport.published_at).toLocaleDateString("th-TH")
                          : "-"}
                      </p>
                    </div>

                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="share-button"
                      >
                        <Share2 size={18} />
                        แชร์และส่งออก
                      </button>

                      {showShareMenu && (
                        <div className="share-menu">
                          <button
                            onClick={() => {
                              copyLink();
                              setShowShareMenu(false);
                            }}
                            className="share-menu-item"
                          >
                            {copiedLink ? (
                              <Copy size={18} color="#10b981" />
                            ) : (
                              <Link2 size={18} color="#667eea" />
                            )}
                            <span style={{ color: copiedLink ? "#10b981" : undefined }}>
                              {copiedLink ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              shareViaEmail();
                              setShowShareMenu(false);
                            }}
                            className="share-menu-item"
                          >
                            <Mail size={18} color="#667eea" />
                            <span>แชร์ทางอีเมล</span>
                          </button>

                          <div className="divider" />

                          {currentReport.pdf && (
                            <a href={currentReport.pdf} download className="share-menu-item">
                              <FileDown size={18} color="#667eea" />
                              <span>ดาวน์โหลด PDF</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <iframe
                    title={currentReport.name}
                    src={currentReport.url}
                    allowFullScreen
                    className="report-frame"
                  />
                </>
              ) : (
                <p>ยังไม่มีรายงาน</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
