import React, { useState } from "react";

export function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

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
        setMessage("User registered successfully!");
        resetForm();
      } else {
        setMessage("Error registering user.");
      }
    } catch (error) {
      setMessage("Error during register. Please try again.");
    }
  }

  function resetForm() {
    setName("");
    setPassword("");
    setEmail("");
    setRole("");
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" value={name} placeholder="Enter your name" onChange={(e) => setName(e.target.value)} required />
        <input type="password" value={password} placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} required />
        <input type="email" value={email} placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="" disabled hidden>Select your role</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
