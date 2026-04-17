import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:8080";

function App() {
  // Auth State
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const [view, setView] = useState(token ? "dashboard" : "login"); // 'login', 'register', 'dashboard'
  const [activeTab, setActiveTab] = useState("bookings"); // 'bookings', 'notifications', 'create'
  
  // Data State
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({ date: "", startTime: "", endTime: "" });
  const [authData, setAuthData] = useState({ username: "", password: "", role: "USER" });
  
  // UI State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    // Check for OAuth2 callback parameters
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlRole = params.get("role");

    if (urlToken && urlRole) {
      localStorage.setItem("token", urlToken);
      localStorage.setItem("role", urlRole);
      setToken(urlToken);
      setUserRole(urlRole);
      setView("dashboard");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchBookings();
      fetchNotifications();
    }
  }, [token]);

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings");
      setBookings(response.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: authData.username,
        password: authData.password
      });
      const { token, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      setToken(token);
      setUserRole(role);
      setView("dashboard");
      setAuthData({ username: "", password: "", role: "USER" });
    } catch (err) {
      setError("Invalid credentials. Please attempt again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, authData);
      alert("Account created successfully! You can now log in.");
      setView("login");
    } catch (err) {
      setError("We couldn't register your account. Please check the username.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserRole(null);
    setView("login");
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      ...formData,
      startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
      endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
    };
    try {
      await api.post("/bookings", payload);
      setFormData({ date: "", startTime: "", endTime: "" });
      fetchBookings();
      setActiveTab("bookings");
      alert("Space booked successfully!");
    } catch (err) {
      setError(err.response?.data || "Uh oh! We couldn't book this slot.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/bookings/${id}/approve`);
      fetchBookings();
      fetchNotifications();
    } catch (err) {
      alert("Approval failed.");
    }
  };

  const stats = {
    pending: bookings.filter(b => b.status === "PENDING").length,
    approved: bookings.filter(b => b.status === "APPROVED").length,
    total: bookings.length
  };

  // --- Views ---

  if (view === "login" || view === "register") {
    return (
      <div className="auth-root">
        <div className="auth-mesh-bg"></div>
        <div className="auth-wrapper">
          <div className="auth-glass-card">
            <div className="auth-logo">
              <span className="logo-icon">✨</span>
              <h2>{view === "login" ? "Welcome Back" : "Join Smart Campus"}</h2>
            </div>
            <p className="auth-subtitle">Elevate your campus experience with a single click.</p>
            
            <form onSubmit={view === "login" ? handleLogin : handleRegister}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={authData.username}
                  onChange={(e) => setAuthData({...authData, username: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                  required
                />
              </div>
              
              {view === "register" && (
                <div className="input-group">
                  <select 
                    className="creative-select"
                    value={authData.role}
                    onChange={(e) => setAuthData({...authData, role: e.target.value})}
                  >
                    <option value="USER">Student (User)</option>
                    <option value="ADMIN">Facility Manager (Admin)</option>
                  </select>
                </div>
              )}

              {error && <div className="error-badge">{error}</div>}

              <button type="submit" disabled={loading} className="btn-glow">
                {loading ? "Crafting session..." : (view === "login" ? "Continue To Dashboard" : "Create Account")}
              </button>
            </form>

            {view === "login" && (
              <>
                <div className="auth-separator">
                  <span>OR</span>
                </div>
                <button 
                  className="btn-google" 
                  onClick={() => window.location.href = `${API_BASE_URL}/oauth2/authorization/google`}
                >
                  <span className="google-icon">G</span> Sign in with Google
                </button>
              </>
            )}
            
            <div className="auth-footer">
              {view === "login" ? "Need an account?" : "Have an account already?"}
              <span className="toggle-link" onClick={() => setView(view === "login" ? "register" : "login")}>
                {view === "login" ? " Get Started" : " Log In"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <span className="logo-sparkle">🛸</span>
          <h1>SmartCampus</h1>
        </div>
        
        <div className="sidebar-links">
          <div className={`nav-item ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>
            <span className="nav-icon">📅</span>
            <span>All Bookings</span>
          </div>
          <div className={`nav-item ${activeTab === "create" ? "active" : ""}`} onClick={() => setActiveTab("create")}>
            <span className="nav-icon">➕</span>
            <span>New Booking</span>
          </div>
          <div className={`nav-item ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>
            <span className="nav-icon">🔔</span>
            <span>Notifications</span>
            {notifications.filter(n => !n.read).length > 0 && <span className="active-dot"></span>}
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">?</div>
            <div className="user-meta">
              <span className="user-name">Campus User</span>
              <span className="role-tag">{userRole}</span>
            </div>
          </div>
          <button className="btn-minimal-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <header className="content-header">
          <div className="header-greeting">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p>Welcome to your control center.</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-val">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card">
              <span className="stat-val text-pending">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <span className="stat-val text-success">{stats.approved}</span>
              <span className="stat-label">Approved</span>
            </div>
          </div>
        </header>

        <section className="dashboard-viewport">
          {activeTab === "bookings" && (
            <div className="creative-grid">
              {bookings.length === 0 ? <p className="empty-state">No bookings found yet.</p> : (
                bookings.map((booking) => (
                  <div key={booking.id} className="booking-glass-card">
                    <div className="card-header">
                      <span className="card-date">{new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span className={`card-status ${booking.status.toLowerCase()}`}>{booking.status}</span>
                    </div>
                    <div className="card-body">
                      <div className="time-range">
                        <span className="time-val">{booking.startTime.substring(0,5)}</span>
                        <span className="time-sep">→</span>
                        <span className="time-val">{booking.endTime.substring(0,5)}</span>
                      </div>
                    </div>
                    {booking.status === "PENDING" && userRole === "ADMIN" && (
                      <button className="btn-approve-modern" onClick={() => handleApprove(booking.id)}>Approve Slot</button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "create" && (
            <div className="form-center-wrapper">
              <div className="glass-form-card">
                <h3>Request Space</h3>
                <form onSubmit={handleCreateBooking}>
                  <div className="form-group-creative">
                    <label>Select Date</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  </div>
                  <div className="form-row-creative">
                    <div className="form-group-creative">
                      <label>Start</label>
                      <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} required />
                    </div>
                    <div className="form-group-creative">
                      <label>End</label>
                      <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} required />
                    </div>
                  </div>
                  {error && <div className="error-hint">{error}</div>}
                  <button type="submit" disabled={loading} className="btn-glow-submit">
                    {loading ? "Verifying..." : "Confirm Request"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="notif-creative-list">
              {notifications.length === 0 ? <p className="empty-state">All caught up!</p> : (
                notifications.map(n => (
                  <div key={n.id} className={`notif-card ${n.read ? 'read' : 'unread'}`}>
                    <div className="notif-icon">💡</div>
                    <div className="notif-content">
                      <p>{n.message}</p>
                      <small>{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
