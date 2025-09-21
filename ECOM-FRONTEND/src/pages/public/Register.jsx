// src/pages/public/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/users/register", form);
      alert("Registered successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: "400px" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="USER">User</option>
          <option value="SELLER">Seller</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      </form>
    </div>
  );
}
