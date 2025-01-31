import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); 
  const navigate = useNavigate(); 

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
            setMessage("Permissions denied");
          } else {
            const { role: userRole } = await profileResponse.json();
            if (userRole === "admin") {
              navigate("/admin"); 
            } else if (userRole === "customer") {
              navigate("/customer"); 
            }
          }
        } catch (error) {
          setMessage("Error fetching profile: " + error);
        }
      }
    } catch (error) {
      setMessage("Error during login: " + error);
    }
    resetForm();
  }

  function resetForm() {
    setEmail("");
    setPassword("");
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginPage;
