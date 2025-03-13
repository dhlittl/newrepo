"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, fetchAuthSession, signOut } from "aws-amplify/auth";
import '@aws-amplify/ui-react/styles.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const router = useRouter();

  // Function to determine redirect path based on user group
  const getRedirectPath = (groups) => {
    if (groups.includes("Admin")) return "/pages/admin";
    else if (groups.includes("Sponsor")) return "/pages/sponsor";
    else if (groups.includes("Driver")) return "/pages/driver";
    else if (groups.includes("Basic_User")) return "/pages/defaultUser";
    return "/";
  };

  // ✅ Check if the user is already authenticated and redirect
  const checkUserSession = async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      
      if (idToken) {
        const groups = idToken.payload["cognito:groups"] || [];
        console.log("User already authenticated. Redirecting...");
        router.push(getRedirectPath(groups));
      }
    } catch (error) {
      console.log("No active user session. User needs to sign in.");
    }
  };

  // ✅ Run session check on page load
  useEffect(() => {
    checkUserSession();
  }, [router]);

  // Validate form inputs
  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle login only if no session exists
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Ensure no active session before signing in
      const session = await fetchAuthSession();
      if (session.tokens?.idToken) {
        console.log("User is already signed in. Redirecting...");
        const groups = session.tokens.idToken.payload["cognito:groups"] || [];
        return router.push(getRedirectPath(groups));
      }
    } catch (error) {
      console.log("No active session, proceeding with sign-in...");
    }

    try {
      // Sign in the user
      await signIn({ username: formData.username, password: formData.password });

      // Fetch user session
      const newSession = await fetchAuthSession();
      if (newSession.tokens?.idToken) {
        const groups = newSession.tokens.idToken.payload["cognito:groups"] || [];
        router.push(getRedirectPath(groups));
      }
    } catch (error) {
      console.error("Sign-in failed:", error);
      setErrors({ auth: error.message || "Login failed" });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Log In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter your username"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter your password"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {errors.auth && <p className="text-red-500 text-sm">{errors.auth}</p>}

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md w-full">
          Log In
        </button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={() => router.push("/signup")} className="text-blue-500 hover:underline">
          Create Account
        </button>
      </div>
    </div>
  );
}
