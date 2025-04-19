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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...aboutData });
  const [successMessage, setSuccessMessage] = useState("");

  const fetchAboutData = async () => {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch about data");

      const data = await response.json();
      const parsedData = data.body ? JSON.parse(data.body) : data;

      setAboutData(parsedData);
      setFormData(parsedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, [endpoint]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newInfo: {
            newTeamNumber: parseInt(formData.TeamNumber),
            newSprintNumber: parseInt(formData.SprintNumber),
            newReleaseDate: formData.ReleaseDate, // must be in YYYY-MM-DD format
            newProductName: formData.ProductName,
            newProductDescription: formData.ProductDescription,
          }
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setIsModalOpen(false);
      setSuccessMessage("About page successfully updated!");
      fetchAboutData();
    } catch (err) {
      console.error("Update failed", err);
      setError("Update failed. Please try again.");
    }
  };

  if (loading || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">{error ? `Error: ${error}` : "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
        <div className="border-b p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">About Our Project</h1>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Edit
          </button>
        </div>

        {successMessage && (
          <div className="px-6 pt-4 text-green-600 font-medium">{successMessage}</div>
        )}

        <div className="p-6 space-y-6">
          {Object.entries(aboutData).map(([key, value], idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700">{key}</h3>
              <p className="mt-1 text-gray-600">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit About Info</h2>
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block font-medium text-gray-700 mb-1">{key}</label>
                <input
                  name={key}
                  value={value}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                />
              </div>
            ))}
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
