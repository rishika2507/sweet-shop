import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Shell = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo-text">Sweet Shop</div>
        <div className="header-links">
          <span className="header-link" onClick={() => navigate("/")}>
            Home
          </span>
          {token && (
            <>
              <span className="header-link" onClick={() => navigate("/admin")}>
                Admin
              </span>
              <span className="header-link" onClick={handleLogout}>
                Logout
              </span>
            </>
          )}
          {!token && (
            <>
              <Link className="header-link" to="/login">
                Login
              </Link>
              <Link className="header-link" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </header>
      <div className="hero-banner" />
      <div className="app-main">{children}</div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Shell>
                <Dashboard />
              </Shell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Shell>
                <AdminPanel />
              </Shell>
            </RequireAuth>
          }
        />
        <Route
          path="/login"
          element={
            <Shell>
              <div className="sidebar" />
              <div className="main-content">
                <Login />
              </div>
            </Shell>
          }
        />
        <Route
          path="/register"
          element={
            <Shell>
              <div className="sidebar" />
              <div className="main-content">
                <Register />
              </div>
            </Shell>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
