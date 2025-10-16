import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout, getCurrentUser } from "../utils/auth";

export default function NavBar() {
  const nav = useNavigate();
  const user = getCurrentUser(); // Changed from currentUser() to getCurrentUser()

  return (
    <header className="app">
      <div>
        <b>✈️ Power BI Airlines</b>
      </div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/feedback">Feedback</Link>
      </nav>
      <div>
        <button className="ghost" onClick={() => {
          document.body.classList.toggle("dark");
        }}>🌓 Theme</button>{" "}
        {isAuthenticated() ? ( // Changed from isAuthed() to isAuthenticated()
          <>
            <span className="muted" style={{marginRight:8}}>
              {user?.username}
            </span>
            <button onClick={() => { logout(); nav("/login"); }}>Logout</button>
          </>
        ) : (
          <button onClick={() => nav("/login")}>Login</button>
        )}
      </div>
    </header>
  );
}