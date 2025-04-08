"use client";

import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import awsExports from "../../../aws-exports";
import { getCurrentUser } from "aws-amplify/auth";

Amplify.configure(awsExports);

const IDTest = () => {
  const [aboutData, setAboutData] = useState({
    User_ID: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      console.log("Fetching about data...");
      try {
        // Get current user's email from AWS Amplify Auth
        const {username, signInDetails} = await getCurrentUser();

        if (!username) {
          throw new Error("Username not found");
        }

        // API endpoint with email as a query parameter
        const apiUrl = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/CurrentUser/?username=${encodeURIComponent(username)}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch about data");
        }

        const data = await response.json();
        console.log("Received data:", data);

        const parsedData = data.body ? JSON.parse(data.body) : data;

        if (
          !parsedData.User_ID
        ) {
          throw new Error("Missing required fields in response");
        }

        setAboutData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        {aboutData.User_ID}
    </div>
  );
};

export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <IDTest/>
    </main>
  );
}
