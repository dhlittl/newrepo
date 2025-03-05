// Login Page

"use client";

import  React , { useState } from 'react';
//import { useRouter } from "next/router";  //import useRouter for redirection later

// create form values for input email and password
export default function LoginPage() {
  const [formData, setFormData] = useState ({
    email: "",
    password: "",
  });
    
  const [errors, setErrors] = useState ({}); // create to handle errors in later function
  //const router = useRouter(); // create router instance to handle redirected

  // function to handle errors
  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if(!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required.";
    if(!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // function to handle login and redirect on event (form filled out and login button hit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if(validateForm()) {
      console.log("Form submitted: ", formData);
      // to do: authentice user data here

      // redirect to proper dashboard here
      router.push("/dashboard");
    }
  };

  // updating info and state on event
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // page display
  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Log In</h2>
      {/* onSubmit triggers handleSubmit when login button is clicked */}
      <form onSubmit={handleSubmit} className="space-y-4"> 
        <div>
          <label className="block text-sm font-medium text-black">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange} // updating email in state
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange} // updating password in state
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter your password"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md w-full">
          Log In
        </button>
      </form>

      {/* "Create Account" button below login inputs */}
      <div className="mt-4 text-center">
        <button
          onClick={() => router.push("/signup")} // handles its own redirect to signup page
          className="text-blue-500 hover:underline"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}