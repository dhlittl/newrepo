'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

export default function SponsorsInfo() {
  const [cognitoSub, setCognitoSub] = useState(null);
  const [userId, setUserId] = useState(null);
  const [sponsorOrgId, setSponsorOrgId] = useState(null);
  const [sponsorInfo, setSponsorInfo] = useState(null);
  const [pointsKey, setPointsKey] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [formData, setFormData] = useState({
    Sponsor_Org_Name: '',
    Sponsor_Description: '',
    Sponsor_Email: '',
    Sponsor_Phone: ''
  });

  // Get Cognito user ID
  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser();
        setCognitoSub(user.userId);
        console.log("Fetched Cognito user ID:", user.userId);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    }

    fetchUser();
  }, []);

  // Get database user ID using Cognito ID
  useEffect(() => {
    async function fetchDatabaseUserId() {
      try {
        if (!cognitoSub) return;
        const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${cognitoSub}`);
        const data = await response.json();

        if (response.ok && data.userId) {
          setUserId(data.userId);
          console.log("Database User ID:", data.userId);
        } else {
          console.error("Error fetching database user ID:", data.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error in user ID mapping:", error);
      }
    }

    fetchDatabaseUserId();
  }, [cognitoSub]);

  // Get Sponsor Org ID using User ID
  useEffect(() => {
    async function fetchSponsorOrgId() {
      try {
        if (!userId) return;

        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers/Info?userId=${userId}`
        );

        if (!response.ok) throw new Error("Failed to fetch sponsor info");

        const data = await response.json();
        if (data && data.Sponsor_Org_ID) {
          setSponsorOrgId(data.Sponsor_Org_ID);
        } else {
          throw new Error("Sponsor Org ID not found");
        }
      } catch (err) {
        setError(err.message || "Unknown error");
      }
    }

    fetchSponsorOrgId();
  }, [userId]);

  // Get Sponsor Info
  useEffect(() => {
    const fetchSponsorInfo = async () => {
      try {
        if (!sponsorOrgId) return;

        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors?SponsorOrgId=${sponsorOrgId}`
        );

        if (!response.ok) throw new Error("Failed to fetch sponsor details");

        const data = await response.json();
        if (data && data.length > 0) {
          setSponsorInfo(data[0]);
          setFormData({
            Sponsor_Org_Name: data[0].Sponsor_Org_Name,
            Sponsor_Description: data[0].Sponsor_Description,
            Sponsor_Email: data[0].Email,
            Sponsor_Phone: data[0].Phone_Number
          });
        } else {
          console.error("No sponsor info found");
        }
      } catch (error) {
        console.error("Error fetching sponsor info:", error);
        setError("Error fetching sponsor info");
      } finally {
        setLoading(false);
      }
    };

    fetchSponsorInfo();
  }, [sponsorOrgId]);

  // Get Points Key for this sponsor
  useEffect(() => {
    const fetchPointsKey = async () => {
      try {
        if (!sponsorOrgId) return;

        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey?sponsorOrgId=${sponsorOrgId}`
        );

        if (!response.ok) {
          console.warn("Failed to fetch points key");
          return;
        }

        const data = await response.json();
        console.log("Points Key Data:", data);
        setPointsKey(data || []);
      } catch (error) {
        console.error("Error fetching points key:", error);
      }
    };

    fetchPointsKey();
  }, [sponsorOrgId]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Save changes to the sponsor info
  const handleSave = async () => {
    try {
        const updatedData = {
            Sponsor_Org_ID: sponsorInfo.Sponsor_Org_ID,
            Sponsor_Org_Name: formData.Sponsor_Org_Name,
            Sponsor_Description: formData.Sponsor_Description,
            Sponsor_Email: formData.Sponsor_Email,     // This field name must match what Lambda expects
            Sponsor_Phone: formData.Sponsor_Phone      // This field name must match what Lambda expects
        };
    
        console.log("Saving sponsor info with data:", updatedData);
        console.log("Sending this data to API:\n", JSON.stringify(updatedData, null, 2));

        // Check that Sponsor_Org_ID is correctly set
        if (!updatedData.Sponsor_Org_ID) {
            throw new Error("Sponsor_Org_ID is missing");
        }

        const response = await fetch(
            `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            }
        );

        console.log("Response status:", response.status);
        
        // Ensure the response is in JSON format and check response.ok
        const result = await response.json();
        console.log("Response from API:", result);

        if (!response.ok) throw new Error(result.error || "Failed to update sponsor");

        console.log("Sponsor updated:", result);

        await refetchSponsorInfo();
        setIsEditing(false);

    } catch (error) {
        console.error("Error saving sponsor info:", error);
        setError("Error saving sponsor info: " + error.message);
    }
    };
  
  // function to manually refresh sponsor info after save
    const refetchSponsorInfo = async () => {
        try {
        const response = await fetch(
            `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors?SponsorOrgId=${sponsorOrgId}`
        );
        if (!response.ok) throw new Error("Failed to fetch sponsor details");
    
        const data = await response.json();
        if (data && data.length > 0) {
            setSponsorInfo(data[0]);
        }
        } catch (err) {
        console.error("Error refetching sponsor info:", err);
        setError("Error refetching sponsor info");
        }
    };
    
  

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-black">Your Organization</h2>

      {loading && <p className="text-gray-500">Loading sponsor info...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && sponsorInfo && (
        <div className="text-gray-700 space-y-2">
          <p><strong>Sponsor Organization ID:</strong> {sponsorInfo.Sponsor_Org_ID}</p>
          
          {isEditing ? (
            <div>
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  name="Sponsor_Org_Name"
                  value={formData.Sponsor_Org_Name}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border"
                />
              </div>
              <div>
                <label>Description:</label>
                <input
                  type="text"
                  name="Sponsor_Description"
                  value={formData.Sponsor_Description}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border"
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="Sponsor_Email"
                  value={formData.Sponsor_Email}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border"
                />
              </div>
              <div>
                <label>Phone:</label>
                <input
                  type="text"
                  name="Sponsor_Phone"
                  value={formData.Sponsor_Phone}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border"
                />
              </div>
              <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-500 text-white">Save Changes</button>
            </div>
          ) : (
            <div>
              <p><strong>Name:</strong> {sponsorInfo.Sponsor_Org_Name || "N/A"}</p>
              <p><strong>Description:</strong> {sponsorInfo.Sponsor_Description || "N/A"}</p>
              <p><strong>Contact:</strong> {sponsorInfo.Email || "N/A"}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-green-500 text-white"
              >
                Edit
              </button>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-semibold mt-6">Points Key</h2>
            <table className="table-auto border-collapse border border-gray-300 mt-2 w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Reason</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Points</th>
                </tr>
              </thead>
              <tbody>
                {pointsKey.map((point, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{point.Reason}</td>
                    <td className="border border-gray-300 px-4 py-2">{point.Points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
