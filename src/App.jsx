import React, { useMemo, useState } from "react";
import AdminDashboard from "./views/AdminDashboard";
import "./App.css";
import "./styles.css";

const AUTH_SESSION_KEY = "ld_admin_tool_authenticated";

function App() {
  const credentials = useMemo(() => {
    const envUser = import.meta.env.VITE_ADMIN_TOOL_USER?.trim();
    const envPassword = import.meta.env.VITE_ADMIN_TOOL_PASSWORD?.trim();

    return {
      username: envUser || "admin",
      password: envPassword || "admin",
      usingDefaultCredentials: !envUser || !envPassword,
    };
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem(AUTH_SESSION_KEY) === "true"
  );
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = (event) => {
    event.preventDefault();

    if (
      formData.username === credentials.username &&
      formData.password === credentials.password
    ) {
      sessionStorage.setItem(AUTH_SESSION_KEY, "true");
      setError("");
      setIsAuthenticated(true);
      return;
    }

    setError("Invalid username or password");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setFormData({ username: "", password: "" });
    setError("");
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <div className="login-wrapper">
          <form className="login-card" onSubmit={handleLogin}>
            <h2>Admin Tool Login</h2>
            {credentials.usingDefaultCredentials && (
              <p className="login-info" role="note">
                Default credentials are active (admin/admin). Set
                VITE_ADMIN_TOOL_USER and VITE_ADMIN_TOOL_PASSWORD to override
                them.
              </p>
            )}
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="custom-button login-button">
              Sign In
            </button>
          </form>
        </div>
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}
export default App;


