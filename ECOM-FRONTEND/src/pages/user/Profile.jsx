// src/pages/user/Profile.jsx
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import apiClient from "../../api/apiClient";

export default function Profile() {
  const { user, setUser } = useAuth(); // make sure AuthContext exposes setUser
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.put(`/users/${user.id}`, formData);
      alert("Profile updated successfully!");
      // Update local storage and context
      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data);
      setFormData(prev => ({ ...prev, password: "" })); // clear password field
    } catch (error) {
      console.error("Profile update failed:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="container" style={{ maxWidth: "500px", margin: "20px auto" }}>
      <h2>My Profile</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "10px",
            cursor: "pointer",
            borderRadius: "6px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none"
          }}
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
