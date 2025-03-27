"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-black mb-6">Happy Driverz Inc</h1>
      <div className="space-y-4 w-full max-w-sm">
        <button
          onClick={() => router.push("/pages/login")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md w-full text-lg">
          Log In
        </button>
        <button
          onClick={() => router.push("/pages/signUpDriver")}
          className="bg-green-500 text-white px-4 py-2 rounded-md w-full text-lg">
          Create Driver Account
        </button>
      </div>
    </div>
  );
}
