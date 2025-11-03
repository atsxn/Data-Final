import { useState, useEffect } from "react";
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
import "../styles.css";

export default function Dashboard() {
  const [reportKey, setReportKey] = useState("aotPassenger");
  const [favorites, setFavorites] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const currentReport = REPORTS[reportKey];
  const categories = ["All", ...new Set(Object.values(REPORTS).map((r) => r.category))];

  useEffect(() => {
    const savedFavorites = ["aotPassenger"];
    setFavorites(savedFavorites);
  }, []);

  useEffect(() => {
    const newView = {
      key: reportKey,
      name: currentReport.name,
      timestamp: new Date().toLocaleString("th-TH"),
    };
    setRecentViews((prev) => {
      const filtered = prev.filter((v) => v.key !== reportKey);
      return [newView, ...filtered].slice(0, 5);
    });
  }, [reportKey, currentReport.name]);

  const toggleFavorite = (key) => {
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href + "?report=" + reportKey);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`แชร์รายงาน: ${currentReport.name}`);
    const body = encodeURIComponent(
      `ดูรายงาน ${currentReport.name} ได้ที่: ${window.location.href}?report=${reportKey}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const filteredReports = Object.entries(REPORTS).filter(([key, report]) => {
    const matchSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "All" || report.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
          <h1 className="text-primary" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            📊 Power BI Dashboard
          </h1>
          <p className="text-secondary">จัดการและวิเคราะห์รายงานของคุณ</p>
        </div>

        {/* Search and Filters */}
        <div className="dashboard-card-sm" style={{ marginBottom: "1.5rem" }}>
          <div className="row" style={{ gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
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
          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Favorites */}
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
                  {favorites.map((key) => (
                    <button
                      key={key}
                      onClick={() => setReportKey(key)}
                      className={`sidebar-item ${reportKey === key ? "active" : ""}`}
                    >
                      <div className="text-primary" style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                        {REPORTS[key].name}
                      </div>
                      <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
                        {REPORTS[key].category}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Views */}
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
                  {recentViews.map((view, idx) => (
                    <button key={idx} onClick={() => setReportKey(view.key)} className="sidebar-item">
                      <div className="text-primary" style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                        {view.name}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                        {view.timestamp}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Report Selection */}
            <div className="dashboard-card-sm">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="text-primary">เลือกรายงาน</h3>
                <button
                  onClick={() => toggleFavorite(reportKey)}
                  className={`favorite-button ${
                    favorites.includes(reportKey) ? "active" : "inactive"
                  }`}
                >
                  <Star
                    size={16}
                    fill={favorites.includes(reportKey) ? "white" : "none"}
                    color={favorites.includes(reportKey) ? "white" : "#718096"}
                  />
                  <span>
                    {favorites.includes(reportKey) ? "ลบออกจากโปรด" : "เพิ่มในรายการโปรด"}
                  </span>
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                {filteredReports.map(([key, report]) => (
                  <button
                    key={key}
                    onClick={() => setReportKey(key)}
                    className={`report-card ${reportKey === key ? "active" : ""}`}
                  >
                    <div className={reportKey === key ? "" : "text-primary"}>{report.name}</div>
                    <div className={reportKey === key ? "" : "text-secondary"}>{report.description}</div>
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: reportKey === key ? "rgba(255,255,255,0.2)" : "#f7fafc",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: reportKey === key ? "white" : "#667eea",
                      }}
                    >
                      {report.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Report */}
            <div className="dashboard-card-sm">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 className="text-primary">{currentReport.name}</h2>
                  <p className="text-secondary">{currentReport.description}</p>
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

                      <a href={currentReport.pdf} download className="share-menu-item">
                        <FileDown size={18} color="#667eea" />
                        <span>ดาวน์โหลด PDF</span>
                      </a>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
