"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { handleSignUp } from "@/components/CreateDriverAccount";

const formatPhoneNumber = (phone) => {
    // If the phone number doesn't start with a plus sign or a country code, add it
    if (!phone.startsWith("+")) {
      // For example, assuming a default country code (e.g., +1 for US)
      phone = `+1${phone.replace(/\D/g, "")}`; // Remove non-digit characters and add country code
    }
    return phone;
  };
  
async function doTheSignInThang(formData) {
    try {
        // Format phone number before passing it to handleSignUp
        const formattedPhone = formatPhoneNumber(formData.phone);

        // Call handleSignUp with the formatted phone number
        await handleSignUp({
        username: formData.username,
        password: formData.password,
        given_name: formData.firstName,
        family_name: formData.lastName,
        email: formData.email,
        phone_number: formattedPhone, // Use the formatted phone number here
        });

    } catch (error) {
        console.error("Error during sign-up:", error);
        // Optionally, show an error message to the user here
    }
}

export default function CreateDriverAccount() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    doTheSignInThang(formData);
    router.push("/pages/signUpDriver/Authenticate");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-black mb-6">Create Driver Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm bg-white p-6 shadow-md rounded-lg">
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

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md w-full text-lg">
          Create Account
        </button>
      </form>
    </div>
  );
}
