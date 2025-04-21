// Sponsor Create Sponsor Page

"use client";
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "aws-amplify/auth";

/* ────────────── Constants ────────────── */
const initialFormState = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  accountType: "Sponsor",
  sponsorOrgId: "", // Set internally
};

/* ────────────── Format phone helper ────────────── */
const formatPhoneNumber = (phone) => {
  if (!phone.startsWith("+")) {
    phone = `+1${phone.replace(/\D/g, "")}`;
  }
  return phone;
};

/* ────────────── User Creation Logic ────────────── */
async function createUserFlow(formData, setSuccess, setFormData, setSubmitErr) {
  try {
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
          group: formData.accountType,
          password: formData.password,
        }),
      }
    );

    const cognitoData = await cognitoRes.json();
    if (!cognitoRes.ok) {
      throw new Error(cognitoData.error || "Failed to create user in Cognito.");
    }

    // 2️⃣ Insert into DB
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
          accountType: formData.accountType,
          sponsorOrgId: formData.sponsorOrgId,
          numPointChanges: 0,
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
    setFormData({ ...initialFormState, sponsorOrgId: formData.sponsorOrgId }); // preserve sponsor ID
  } catch (err) {
    console.error("Submission error:", err);
    setSubmitErr(err.message || "Something went wrong.");
  }
}

/* ────────────── Main Component ────────────── */
export default function SponsorCreateAccount() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  /* ───── Validate Form ───── */
  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ───── Fetch sponsorOrgId via current user ───── */
  useEffect(() => {
    async function fetchSponsorOrgId() {
      try {
        const user = await getCurrentUser();
        const cognitoSub = user.userId;

        // Get internal User ID
        const userRes = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${cognitoSub}`
        );
        const userData = await userRes.json();

        if (userRes.ok && userData.userId) {
          // Get Sponsor Org
          const orgRes = await fetch(
            `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers/Info?userId=${userData.userId}`
          );
          const orgData = await orgRes.json();

          if (orgRes.ok && orgData?.Sponsor_Org_ID) {
            setFormData((prev) => ({
              ...prev,
              sponsorOrgId: orgData.Sponsor_Org_ID,
            }));
          } else {
            console.warn("Sponsor Org ID not found for user.");
          }
        }
      } catch (err) {
        console.error("Error auto-setting sponsorOrgId:", err);
      }
    }

    fetchSponsorOrgId();
  }, []);

  /* ───── Handle Submit ───── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    if (!validateForm()) return;
    await createUserFlow(formData, setSuccessMessage, setFormData, setSubmitError);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-black mb-6">Create Sponsor User</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-sm bg-white p-6 shadow-md rounded-lg"
      >
        {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
        {submitError && <p className="text-red-500 text-sm text-center">{submitError}</p>}

        <FormInput
          label="Username"
          value={formData.username}
          onChange={(v) => setFormData({ ...formData, username: v })}
          error={errors.username}
        />
        <FormInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={(v) => setFormData({ ...formData, password: v })}
          error={errors.password}
        />
        <FormInput
          label="First Name"
          value={formData.firstName}
          onChange={(v) => setFormData({ ...formData, firstName: v })}
          error={errors.firstName}
        />
        <FormInput
          label="Last Name"
          value={formData.lastName}
          onChange={(v) => setFormData({ ...formData, lastName: v })}
          error={errors.lastName}
        />
        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(v) => setFormData({ ...formData, email: v })}
          error={errors.email}
        />
        <FormInput
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(v) => setFormData({ ...formData, phone: v })}
          error={errors.phone}
        />

        <div>
          <label className="block text-sm font-medium text-black">Account Type</label>
          <div className="mt-1 p-2 w-full border rounded-md text-black bg-gray-100">
            Sponsor
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Sponsor Organization</label>
          <div className="mt-1 p-2 w-full border rounded-md text-black bg-gray-100">
            {formData.sponsorOrgId || "Fetching..."}
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md w-full text-lg"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}

/* ────────────── Reusable Input Component ────────────── */
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
