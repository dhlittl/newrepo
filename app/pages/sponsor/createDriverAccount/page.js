"use client";
import React, { useState, useEffect } from "react";
import { getCurrentUser } from 'aws-amplify/auth';

/* ────────────── Helper: Format phone ────────────── */
const formatPhoneNumber = (phone) => {
  if (!phone.startsWith("+")) {
    phone = `+1${phone.replace(/\D/g, "")}`;
  }
  return phone;
};

/* ────────────── Helper: Submit logic ────────────── */
async function createUserFlow(formData, setSuccess, setFormData, setSubmitErr, sponsorOrgId) {
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
        group: "Driver",
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
    "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/add",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formattedPhone,
        sponsorOrgId: sponsorOrgId,
        cognitoSub: cognitoData.cognitoSub || "",
      }),
    }
  );

  const dbData = await dbRes.json();
  console.log(dbData);
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
  const [cognitoSub, setCognitoSub] = useState(null);
    const [userId, setUserId] = useState(null);
    const [sponsorOrgId, setSponsorOrgId] = useState(null);
    const [fetchStatus, setFetchStatus] = useState({
        user: 'idle',
        userId: 'idle',
        orgId: 'idle'
      });

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

    useEffect(() => {
            async function fetchUser() {
                try {
                    setFetchStatus(prev => ({...prev, user: 'loading'}));
                    const user = await getCurrentUser();
                    setCognitoSub(user.userId);
                    console.log("Fetched Cognito user ID:", user.userId);
                    setFetchStatus(prev => ({...prev, user: 'success'}));
                } catch (error) {
                    console.error("Error fetching current user:", error);
                    setFetchStatus(prev => ({...prev, user: 'error'}));
                    setError("Failed to authenticate user. Please try again or contact support.");
                    setLoading(false);
                }
            }
    
            fetchUser();
        }, []);
      
        // fetch user_id based off cognito sub
        useEffect(() => {
            if (!cognitoSub) return;
        
            async function fetchUserId() {
                try {
                    setFetchStatus(prev => ({...prev, userId: 'loading'}));
                    const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${cognitoSub}`);
                    const data = await response.json();
            
                    if (response.ok && data.userId) {
                        setUserId(data.userId);
                        console.log("Database User ID:", data.userId);
                        setFetchStatus(prev => ({...prev, userId: 'success'}));
                    } else {
                        console.error("Error fetching database user ID:", data.error || "Unknown error");
                        setFetchStatus(prev => ({...prev, userId: 'error'}));
                        setError("Could not find your user account. Please contact an administrator.");
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error in user ID mapping:", error);
                    setFetchStatus(prev => ({...prev, userId: 'error'}));
                    setError("Failed to retrieve user information. Please try again later.");
                    setLoading(false);
                }
            }
            
            fetchUserId();
        }, [cognitoSub]);
      
        // gets sponsor org id from user id
        useEffect(() => {
            if (!userId) return;
        
            async function fetchSponsorOrg() {
                try {
                    setFetchStatus(prev => ({...prev, orgId: 'loading'}));
                    const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers/Info?userId=${userId}`);
                    
                    if (!res.ok) {
                        throw new Error(`Failed to fetch sponsor org with status: ${res.status}`);
                    }
                    
                    const data = await res.json();
                    console.log("Sponsor org API response:", data);
            
                    if (data?.Sponsor_Org_ID) {
                        setSponsorOrgId(data.Sponsor_Org_ID);
                        console.log("Sponsor Org ID:", data.Sponsor_Org_ID);
                        setFetchStatus(prev => ({...prev, orgId: 'success'}));
                    } else {
                        console.error("No Sponsor_Org_ID found in response:", data);
                        setFetchStatus(prev => ({...prev, orgId: 'error'}));
                        setError("You don't appear to be associated with a sponsor organization.");
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error fetching sponsor org info:", error);
                    setFetchStatus(prev => ({...prev, orgId: 'error'}));
                    setError("Failed to retrieve your sponsor organization. Please contact support.");
                    setLoading(false);
                }
            }
        
            fetchSponsorOrg();
        }, [userId]);
    
        // Auto-populate sponsorOrgId in the form
        useEffect(() => {
            if (sponsorOrgId) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                sponsorOrgId: sponsorOrgId, // Auto-populate the sponsorOrgId
            }));
            }
        }, [sponsorOrgId]);
    

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    if (!validateForm()) return;

    try {
      await createUserFlow(formData, setSuccessMessage, setFormData, setSubmitError, sponsorOrgId);
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
