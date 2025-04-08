"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "aws-amplify/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await resetPassword({ username });
      setMessage("Verification code sent.");
      router.push(`/pages/login/reset-password?username=${encodeURIComponent(username)}`);
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrors({ auth: error.message || "Something went wrong." });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-black mb-4">Forgot Password</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-sm bg-white p-6 shadow-md rounded-lg"
      >
        <div>
          <label className="block text-sm font-medium text-black">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter your username"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>

        {errors.auth && <p className="text-red-500 text-sm">{errors.auth}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md w-full text-lg"
        >
          Send Reset Code
        </button>
      </form>
    </div>
  );
}
