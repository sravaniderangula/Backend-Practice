import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./LoginPage";    
import Register from "./Register"; 
export default function Home() {
  return (
    <BrowserRouter>
      <nav>
        <ul>
          <li><Link to="/login" element={<LoginPage/>}>Login</Link></li>
          <li><Link to="/register" element={<Register/>}>Register</Link></li>
         
        </ul>
      </nav>

    </BrowserRouter>
  );
}
