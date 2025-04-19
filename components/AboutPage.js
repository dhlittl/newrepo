"use client";

import React, { useEffect, useState } from "react";

export default function AboutPage({ endpoint = "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/about" }) {
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
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch about data");
        }

        const data = await response.json();
        const parsedData = data.body ? JSON.parse(data.body) : data;

        setAboutData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [endpoint]);

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
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-center text-black">
            About Our Project
          </h1>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {[
              ["Team Number", aboutData.TeamNumber],
              ["Version/Sprint Number", aboutData.SprintNumber],
              ["Release Date", aboutData.ReleaseDate],
              ["Product Name", aboutData.ProductName],
              ["Product Description", aboutData.ProductDescription],
            ].map(([label, value], idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700">{label}</h3>
                <p className="mt-1 text-gray-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
