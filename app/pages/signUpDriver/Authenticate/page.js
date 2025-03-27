"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { handleSignUpConfirmation } from "@/components/CreateDriverAccount";

async function doTheConfirmThang(formData){
    try{
        handleSignUpConfirmation({username: formData.username, confirmationCode: formData.verificationCode});
    } catch (error) {
        console.error("Error during confirmation:", error);
    }
}

export default function AuthenticationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    verificationCode: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.verificationCode.trim()) newErrors.verificationCode = "Verification code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    doTheConfirmThang(formData);
    // Redirect to a success or next page
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-black mb-6">Authenticate</h1>
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
          <label className="block text-sm font-medium text-black">Verification Code</label>
          <input
            type="text"
            value={formData.verificationCode}
            onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter verification code"
          />
          {errors.verificationCode && <p className="text-red-500 text-sm">{errors.verificationCode}</p>}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md w-full text-lg">
          Authenticate
        </button>
      </form>
    </div>
  );
}
