"use client";

import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import awsExports from "../../../aws-exports";
import { Auth } from "aws-amplify";

Amplify.configure(awsExports);

const AboutPage = () => {
  const [aboutData, setAboutData] = useState({
    TeamNumber: "",
    SprintNumber: "",
    ReleaseDate: "",
    ProductName: "",
    ProductDescription: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      console.log("Fetching about data...");
      try {
        // Get current user's email from AWS Amplify Auth
        const currentUser = await Auth.currentUserInfo();
        const email = currentUser?.attributes?.email;

        if (!email) {
          throw new Error("User email not found");
        }

        // API endpoint with email as a query parameter
        const apiUrl = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/CurrentUser/?email=${encodeURIComponent(email)}`;

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
          !parsedData.TeamNumber ||
          !parsedData.SprintNumber ||
          !parsedData.ReleaseDate ||
          !parsedData.ProductName ||
          !parsedData.ProductDescription
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
      {/* Display the about data here */}
      <div>
        <h1 className="text-2xl font-semibold">{aboutData.ProductName}</h1>
        <p>{aboutData.ProductDescription}</p>
        <ul>
          <li><strong>Team Number:</strong> {aboutData.TeamNumber}</li>
          <li><strong>Sprint Number:</strong> {aboutData.SprintNumber}</li>
          <li><strong>Release Date:</strong> {aboutData.ReleaseDate}</li>
        </ul>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <AboutPage />
    </main>
  );
}
