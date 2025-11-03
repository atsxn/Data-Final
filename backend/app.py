# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import datetime
import hashlib
import jwt

app = Flask(__name__)
# Allow all origins in development - adjust for production
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"], supports_credentials=True)

# Configuration
SECRET_KEY = "super-secret-change-me-in-production"
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

USERS_FILE = os.path.join(DATA_DIR, "users.json")
FAVORITES_FILE = os.path.join(DATA_DIR, "favorites.json")
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")
FEEDBACK_FILE = os.path.join(DATA_DIR, "feedback.json")

# ---------- File Utilities ----------

def ensure_file(path, default_data):
    """Create file with default data if it doesn't exist"""
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(default_data, f, ensure_ascii=False, indent=2)

def load_json(path):
    """Load JSON file"""
    ensure_file(path, {})
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    """Save data to JSON file"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def create_token(user_id: int, username: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": user_id,
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def require_user(fn):
    """Decorator to require authentication"""
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"success": False, "message": "Authentication required"}), 401
        
        token = auth.split(" ")[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = data
            return fn(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token expired"}), 401
        except Exception as e:
            return jsonify({"success": False, "message": "Invalid token"}), 401
    
    wrapper.__name__ = fn.__name__
    return wrapper

# ---------- Initialize JSON Files ----------

def init_json_files():
    """Initialize all required JSON files"""
    ensure_file(USERS_FILE, {"users": []})
    ensure_file(FAVORITES_FILE, {"favorites": []})
    ensure_file(HISTORY_FILE, {"history": []})
    ensure_file(FEEDBACK_FILE, {"feedback": []})

# =========================================================
#  AUTHENTICATION ROUTES
# =========================================================

@app.post("/api/register")
def api_register():
    """Register new user"""
    body = request.get_json() or {}
    username = body.get("username", "").strip()
    email = body.get("email", "").strip()
    password = body.get("password", "")

    if not username or not email or not password:
        return jsonify({"success": False, "message": "กรอกข้อมูลให้ครบ"}), 400

    db = load_json(USERS_FILE)
    users = db.get("users", [])

    # Check for duplicates
    for u in users:
        if u["username"] == username:
            return jsonify({"success": False, "message": "มีชื่อผู้ใช้นี้แล้ว"}), 400
        if u["email"] == email:
            return jsonify({"success": False, "message": "อีเมลนี้ถูกใช้แล้ว"}), 400

    new_user = {
        "id": (max([u["id"] for u in users]) + 1) if users else 1,
        "username": username,
        "email": email,
        "password_hash": hash_password(password),
        "created_at": datetime.datetime.utcnow().isoformat() + "Z",
    }
    users.append(new_user)
    db["users"] = users
    save_json(USERS_FILE, db)

    token = create_token(new_user["id"], new_user["username"])
    return jsonify({
        "success": True, 
        "token": token, 
        "user": {"id": new_user["id"], "username": new_user["username"]}
    })

@app.post("/api/login")
def api_login():
    """Login user"""
    body = request.get_json() or {}
    username = body.get("username", "")
    password = body.get("password", "")

    db = load_json(USERS_FILE)
    users = db.get("users", [])

    user = next((u for u in users if u["username"] == username), None)
    if not user:
        return jsonify({"success": False, "message": "ไม่พบบัญชีนี้"}), 401

    if user["password_hash"] != hash_password(password):
        return jsonify({"success": False, "message": "รหัสผ่านไม่ถูกต้อง"}), 401

    # Update last login
    user["last_login"] = datetime.datetime.utcnow().isoformat() + "Z"
    save_json(USERS_FILE, db)

    token = create_token(user["id"], user["username"])
    return jsonify({
        "success": True, 
        "token": token, 
        "user": {"id": user["id"], "username": user["username"]}
    })

@app.get("/api/me")
@require_user
def api_me():
    """Get current user info"""
    return jsonify({
        "success": True,
        "user": {
            "id": request.user["sub"],
            "username": request.user["username"]
        }
    })

# =========================================================
#  FAVORITES ROUTES
# =========================================================

@app.get("/api/favorites")
@require_user
def api_get_favorites():
    """Get user's favorite reports"""
    user_id = request.user["sub"]
    fav_db = load_json(FAVORITES_FILE)
    favs = fav_db.get("favorites", [])
    user_favs = [f["report_code"] for f in favs if f["user_id"] == user_id]
    return jsonify({"success": True, "favorites": user_favs})

@app.post("/api/favorites")
@require_user
def api_add_favorite():
    """Add report to favorites"""
    user_id = request.user["sub"]
    body = request.get_json() or {}
    report_code = body.get("report_code")
    
    if not report_code:
        return jsonify({"success": False, "message": "report_code required"}), 400

    fav_db = load_json(FAVORITES_FILE)
    favs = fav_db.get("favorites", [])

    # Prevent duplicates
    exists = any(f["user_id"] == user_id and f["report_code"] == report_code for f in favs)
    if not exists:
        favs.append({
            "user_id": user_id,
            "report_code": report_code,
            "created_at": datetime.datetime.utcnow().isoformat() + "Z"
        })
        fav_db["favorites"] = favs
        save_json(FAVORITES_FILE, fav_db)

    return jsonify({"success": True})

@app.delete("/api/favorites/<code>")
@require_user
def api_remove_favorite(code):
    """Remove report from favorites"""
    user_id = request.user["sub"]
    fav_db = load_json(FAVORITES_FILE)
    favs = fav_db.get("favorites", [])

    new_favs = [f for f in favs if not (f["user_id"] == user_id and f["report_code"] == code)]
    fav_db["favorites"] = new_favs
    save_json(FAVORITES_FILE, fav_db)

    return jsonify({"success": True})

# =========================================================
#  HISTORY ROUTES
# =========================================================

@app.post("/api/history")
@require_user
def api_add_history():
    """Add report view to history"""
    user_id = request.user["sub"]
    body = request.get_json() or {}
    report_code = body.get("report_code")
    
    if not report_code:
        return jsonify({"success": False, "message": "report_code required"}), 400

    hist_db = load_json(HISTORY_FILE)
    hist = hist_db.get("history", [])

    hist.append({
        "user_id": user_id,
        "report_code": report_code,
        "viewed_at": datetime.datetime.utcnow().isoformat() + "Z"
    })

    hist_db["history"] = hist
    save_json(HISTORY_FILE, hist_db)

    return jsonify({"success": True})

@app.get("/api/history")
@require_user
def api_get_history():
    """Get user's view history"""
    user_id = request.user["sub"]
    hist_db = load_json(HISTORY_FILE)
    hist = hist_db.get("history", [])
    
    # Filter and sort by most recent
    user_hist = [h for h in hist if h["user_id"] == user_id]
    user_hist.sort(key=lambda x: x["viewed_at"], reverse=True)
    
    return jsonify({"success": True, "history": user_hist[:20]})

# =========================================================
#  FEEDBACK ROUTES
# =========================================================

@app.post("/api/feedback")
@require_user
def api_feedback():
    """Submit feedback"""
    user_id = request.user["sub"]
    body = request.get_json() or {}
    text = body.get("text", "").strip()
    
    if not text:
        return jsonify({"success": False, "message": "feedback ว่าง"}), 400

    fb_db = load_json(FEEDBACK_FILE)
    fb = fb_db.get("feedback", [])

    fb.append({
        "user_id": user_id,
        "text": text,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    })

    fb_db["feedback"] = fb
    save_json(FEEDBACK_FILE, fb_db)

    return jsonify({"success": True, "message": "บันทึก feedback แล้ว"})

# =========================================================
#  MAIN
# =========================================================

if __name__ == "__main__":
    init_json_files()
    app.run(debug=True, host="127.0.0.1", port=5000)