// Hash password using SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Load users from memory (simulating user.json)
function loadUsers() {
  const usersData = localStorage.getItem('users');
  if (!usersData) {
    const defaultUsers = {
      admin: {
        username: "admin",
        password: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123 hashed
        email: "admin@example.com",
        role: "admin",
        createdAt: new Date().toISOString()
      }
    };
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(usersData);
}

// Save users to memory (simulating user.json)
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Register new user
export async function register(username, password, email) {
  try {
    const users = loadUsers();

    // Check if username already exists
    if (users[username]) {
      return { success: false, message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" };
    }

    // Check if email already exists
    const emailExists = Object.values(users).some(user => user.email === email);
    if (emailExists) {
      return { success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    users[username] = {
      username: username,
      password: hashedPassword,
      email: email,
      role: "user",
      createdAt: new Date().toISOString()
    };

    // Save to storage
    saveUsers(users);

    return { success: true, message: "สมัครสมาชิกสำเร็จ" };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" };
  }
}

// Login user
export async function login(username, password) {
  try {
    const users = loadUsers();
    const user = users[username];

    if (!user) {
      return { success: false, message: "ไม่พบชื่อผู้ใช้นี้" };
    }

    // Hash input password and compare
    const hashedPassword = await hashPassword(password);
    
    if (hashedPassword !== user.password) {
      return { success: false, message: "รหัสผ่านไม่ถูกต้อง" };
    }

    // Store session
    const session = {
      username: user.username,
      email: user.email,
      role: user.role,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem('session', JSON.stringify(session));

    return { success: true, user: session };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
  }
}

// Check if user is logged in
export function isAuthenticated() {
  const session = localStorage.getItem('session');
  return !!session;
}

// Get current user
export function getCurrentUser() {
  const session = localStorage.getItem('session');
  return session ? JSON.parse(session) : null;
}

// Logout
export function logout() {
  localStorage.removeItem('session');
}

// Get all users (admin only)
export function getAllUsers() {
  const currentUser = getCurrentUser();
  if (currentUser?.role !== 'admin') {
    return null;
  }
  return loadUsers();
}
