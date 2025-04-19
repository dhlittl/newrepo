"use client";
import React, { useState } from "react";

/* ────────────── Helper: Format phone ────────────── */
const formatPhoneNumber = (phone) => {
  if (!phone.startsWith("+")) {
    phone = `+1${phone.replace(/\D/g, "")}`;
  }
  return phone;
};

/* ────────────── Helper: Submit logic ────────────── */
async function createUserFlow(formData, setSuccess, setFormData, setSubmitErr) {
  const formattedPhone = formatPhoneNumber(formData.phone);

  // 1️⃣ Create Cognito user
  const cognitoRes = await fetch(
    "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/createUser",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formattedPhone,
        group: formData.accountType === "Driver" ? "DefaultUser" : formData.accountType,
        password: formData.password,
      }),
    }
  );

  const cognitoData = await cognitoRes.json();
  if (!cognitoRes.ok) {
    throw new Error(cognitoData.error || "Failed to create user in Cognito.");
  }

  // 2️⃣ Create DB record
  const dbRes = await fetch(
    "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formattedPhone,
        accountType: formData.accountType === "Driver" ? "DefaultUser" : formData.accountType,
        sponsorOrgId:
          formData.accountType === "Sponsor" || formData.accountType === "Driver"
            ? formData.sponsorOrgId || null
            : null,
        numPointChanges: formData.accountType === "Sponsor" ? 0 : null,
        cognitoSub: cognitoData.cognitoSub || "",
      }),
    }
  );

  const dbData = await dbRes.json();
  if (!dbRes.ok) {
    throw new Error(dbData.error || "User added to Cognito, but DB insert failed.");
  }

  // ✅ Success
  setSuccess("Account created successfully!");
  setSubmitErr("");
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
}

/* ────────────── Main Component ────────────── */
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
  const [submitError, setSubmitError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    if (!validateForm()) return;

    try {
      await createUserFlow(formData, setSuccessMessage, setFormData, setSubmitError);
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-black mb-6">Create Account</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-sm bg-white p-6 shadow-md rounded-lg"
      >
        {/* Username */}
        <FormInput
          label="Username"
          value={formData.username}
          onChange={(v) => setFormData({ ...formData, username: v })}
          error={errors.username}
        />

        {/* Password */}
        <FormInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={(v) => setFormData({ ...formData, password: v })}
          error={errors.password}
        />

        {/* First Name */}
        <FormInput
          label="First Name"
          value={formData.firstName}
          onChange={(v) => setFormData({ ...formData, firstName: v })}
          error={errors.firstName}
        />

        {/* Last Name */}
        <FormInput
          label="Last Name"
          value={formData.lastName}
          onChange={(v) => setFormData({ ...formData, lastName: v })}
          error={errors.lastName}
        />

        {/* Email */}
        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(v) => setFormData({ ...formData, email: v })}
          error={errors.email}
        />

        {/* Phone Number */}
        <FormInput
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(v) => setFormData({ ...formData, phone: v })}
          error={errors.phone}
        />

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

        {/* Sponsor Organization ID Field (Only for Sponsor) */}
        {formData.accountType === "Sponsor" && (
          <FormInput
            label="Sponsor Organization ID"
            value={formData.sponsorOrgId}
            onChange={(v) => setFormData({ ...formData, sponsorOrgId: v })}
            error={errors.sponsorOrgId}
          />
        )}

        {/* Success / Error Messages */}
        {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
        {submitError && <p className="text-red-500 text-sm text-center">{submitError}</p>}

        {/* Submit Button */}
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md w-full text-lg">
          Create Account
        </button>
      </form>
    </div>
  );
}

/* ────────────── Reusable Input Field ────────────── */
function FormInput({ label, type = "text", value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-black">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 p-2 w-full border rounded-md text-black"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
