// Sponsor Create Sponsor Page

"use client";
import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

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
      "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers",
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
    accountType: "Sponsor",
    sponsorOrgId: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchStatus, setFetchStatus] = useState({
    user: 'idle',
    userId: 'idle',
    orgId: 'idle'
  });
  const [cognitoSub, setCognitoSub] = useState(null);
  const [userId, setUserId] = useState(null);
  const [sponsorOrgId, setSponsorOrgId] = useState(null);

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

    // fetch current user (gets cognito_sub)
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

        {/* Account Type (Always shows "Sponsor") */}
        <div>
        <label className="block text-sm font-medium text-black">Account Type</label>
        <div className="mt-1 p-2 w-full border rounded-md text-black bg-gray-100">
            Sponsor
        </div>
        </div>

        {/* Sponsor Organization ID Field (Only for Sponsors) */}
        {formData.accountType === "Sponsor" && (
        <div>
            <label className="block text-sm font-medium text-black">Sponsor Organization ID</label>
            <div className="mt-1 p-2 w-full border rounded-md text-black bg-gray-100">
            {formData.sponsorOrgId || "No Sponsor Organization ID"} {/* Display the ID or a default message */}
            </div>
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
