"use client";
import React, { useState } from "react";

const formatPhoneNumber = (phone) => {
  if (!phone.startsWith("+")) {
    phone = `+1${phone.replace(/\D/g, "")}`;
  }
  return phone;
};

async function doTheSignInThang(formData, setSuccessMessage, setFormData) {
  try {
    const formattedPhone = formatPhoneNumber(formData.phone);

    const response = await fetch(
      "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formattedPhone,
          accountType: formData.accountType,
          sponsorOrgId: formData.accountType === "Sponsor" ? formData.sponsorOrgId : null,
          numPointChanges: formData.accountType === "Sponsor" ? 0 : null,
          cognitoSub: "", // As originally provided
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setSuccessMessage("Account created successfully!");
      setFormData({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        accountType: "Driver",
        sponsorOrgId: "",
      });
    } else {
      console.error("Error during user creation:", data.error || "Unknown error");
    }
  } catch (error) {
    console.error("Error during sign-up:", error);
  }
}

export default function CreateAccount() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    accountType: "Driver",
    sponsorOrgId: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (formData.accountType === "Sponsor" && !formData.sponsorOrgId.trim()) {
      newErrors.sponsorOrgId = "Sponsor Organization ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage(""); // Clear previous success message
    if (!validateForm()) return;
    doTheSignInThang(formData, setSuccessMessage, setFormData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-black mb-6">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm bg-white p-6 shadow-md rounded-lg">

        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-black">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter username"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-black">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter password"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {/* First Name Field */}
        <div>
          <label className="block text-sm font-medium text-black">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter first name"
          />
          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
        </div>

        {/* Last Name Field */}
        <div>
          <label className="block text-sm font-medium text-black">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter last name"
          />
          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-black">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter email"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Phone Number Field */}
        <div>
          <label className="block text-sm font-medium text-black">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter phone number"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        {/* Account Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-black">Account Type</label>
          <select
            value={formData.accountType}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
          >
            <option value="Driver">Driver</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Sponsor Organization ID Field (Only for Sponsors) */}
        {formData.accountType === "Sponsor" && (
          <div>
            <label className="block text-sm font-medium text-black">Sponsor Organization ID</label>
            <input
              type="text"
              value={formData.sponsorOrgId}
              onChange={(e) => setFormData({ ...formData, sponsorOrgId: e.target.value })}
              className="mt-1 p-2 w-full border rounded-md text-black"
              placeholder="Enter sponsor organization ID"
            />
            {errors.sponsorOrgId && <p className="text-red-500 text-sm">{errors.sponsorOrgId}</p>}
          </div>
        )}

        {/* Success Message */}
        {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}

        {/* Submit Button */}
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md w-full text-lg">
          Create Account
        </button>
      </form>
    </div>
  );
}
