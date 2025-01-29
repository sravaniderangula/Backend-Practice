import React, { useState } from "react";
import CustomerPage from "./CustomerPage";
import AdminPage from "./AdminPage";

function App() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [page, setPage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    const user = { email, password };

    try {
      const response = await fetch("http://localhost:20304/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Login failed: " + response.statusText);
      }

      const { token } = await response.json();
      if (token) {
        localStorage.setItem("authToken", token);

        try {
          const profileResponse = await fetch("http://localhost:20304/api/profile", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!profileResponse.ok) {
            console.log("Permissions denied");
          } else {
            const { role: userRole } = await profileResponse.json();
            setPage(userRole);
          }
        } catch (error) {
          console.log("Error fetching profile:", error);
        }
      }
    } catch (error) {
      console.log("Error during login:", error);
    }
    resetForm();
  }

  async function handleRegister(event) {
    event.preventDefault();
    const user = { name, password, email, role };

    try {
      const response = await fetch("http://localhost:20304/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        console.log("User registered successfully");
      } else {
        console.log("Error registering user");
      }
    } catch (error) {
      console.log("Error during register:", error);
    }
    resetForm();
  }

  function resetForm() {
    setName("");
    setPassword("");
    setEmail("");
    setRole("");
  }

  function renderForm(isLogin) {
    return (
      <div style={{ width: "400px", margin: "50px auto", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <input type="text" value={name} placeholder="Enter your name" onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="password" value={password} placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} required />
          <input type="email" value={email} placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />
          {!isLogin && (
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="" disabled hidden>
                Select your role
              </option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          )}
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
      </div>
    );
  }

  if (page === "admin") {
    return <AdminPage />;
  } else if (page === "customer") {
    return <CustomerPage />;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <select value={isLoggedIn ? "login" : "register"} onChange={(e) => setIsLoggedIn(e.target.value === "login")}>
        <option value="login">Login</option>
        <option value="register">Register</option>
      </select>
      {renderForm(isLoggedIn)}
    </div>
  );
}

export default App;
