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
  const [isEditingPointsKey, setIsEditingPointsKey] = useState(false); // Track points key edit mode
  const [formData, setFormData] = useState({
    Sponsor_Org_Name: '',
    Sponsor_Description: '',
    Sponsor_Email: '',
    Sponsor_Phone: ''
  });
  
  // For adding new points key entries
  const [newReason, setNewReason] = useState("");
  const [newPoints, setNewPoints] = useState("");

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
            Sponsor_Email: formData.Sponsor_Email,
            Sponsor_Phone: formData.Sponsor_Phone
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

  // Function to refresh the points key table
  const refetchPointsKey = async () => {
    try {
      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey?sponsorOrgId=${sponsorOrgId}`
      );
      
      if (!response.ok) {
        console.warn("Failed to refresh points key");
        return;
      }
      
      const data = await response.json();
      setPointsKey(data || []);
    } catch (error) {
      console.error("Error refreshing points key:", error);
    }
  };
    
  // Handle editing points
  const handleEditPoints = (e, index) => {
    const updatedPointsKey = [...pointsKey];  // copy of current pointsKey array
    updatedPointsKey[index].Points = e.target.value;  // update point value
    setPointsKey(updatedPointsKey);  // update state
  
    const reasonData = updatedPointsKey[index];
  
    // PUT request to update the points on the backend
    fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reasonId: reasonData.Reason_ID,
        reason: reasonData.Reason,
        points: reasonData.Points,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update points');
      }
      return response.json();
    })
    .then(data => {
      console.log('Points updated successfully:', data);
    })
    .catch(error => {
      console.error('Error updating points:', error);
    });
  };

  // Handle editing reason text
  const handleEditReason = (e, index) => {
    const updatedPointsKey = [...pointsKey];  // copy of current pointsKey array
    updatedPointsKey[index].Reason = e.target.value;  // update reason text
    setPointsKey(updatedPointsKey);  // update state
  
    const reasonData = updatedPointsKey[index];
  
    // PUT request to update the reason on the backend
    fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reasonId: reasonData.Reason_ID,
        reason: reasonData.Reason,
        points: reasonData.Points,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update reason');
      }
      return response.json();
    })
    .then(data => {
      console.log('Reason updated successfully:', data);
    })
    .catch(error => {
      console.error('Error updating reason:', error);
    });
  };

  // Handle deleting reason
  const handleDeleteReason = async (reasonId) => {
    try {
      console.log("Attempting to delete reason ID:", reasonId);
      
      if (!reasonId) {
        console.error("Invalid reason ID:", reasonId);
        alert("Cannot delete: Invalid reason ID");
        return;
      }
      
      // using path parameter format
      const deleteUrl = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey/${reasonId}`;
      console.log("Delete URL:", deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `Failed to delete reason (Status: ${response.status})`);
      }
      
      // remove deleted reason from ui
      setPointsKey(pointsKey.filter(reason => reason.Reason_ID !== reasonId));
      
    } catch (error) {
      console.error("Error details:", error);
      alert("Failed to delete reason: " + error.message);
    }
  };

  // Handle adding new reason
  const handleAddReason = async () => {
    try {
      // Input validation
      if (!newReason || !newPoints) {
        alert("Please enter both a reason and points value");
        return;
      }
      
      console.log("Adding new reason:", newReason, newPoints);
      
      const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsorOrgId: parseInt(sponsorOrgId),
          reason: newReason,
          points: parseInt(newPoints),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add reason');
      }
      
      console.log("API Response:", data);
      
      // Refresh the points key data
      await refetchPointsKey();
      
      // clear input fields after
      setNewReason("");
      setNewPoints("");
    } catch (error) {
      console.error("Error adding new reason:", error);
      alert("Failed to add new reason: " + error.message);
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
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Points Key</h2>
              <button
                onClick={() => setIsEditingPointsKey(!isEditingPointsKey)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {isEditingPointsKey ? "Save Changes" : "Edit Points Key"}
              </button>
            </div>
            
            <table className="table-auto border-collapse border border-gray-300 mt-2 w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Reason</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Points</th>
                  {isEditingPointsKey && <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pointsKey.map((point, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {isEditingPointsKey ? (
                        <input
                          type="text"
                          value={point.Reason}
                          onChange={(e) => handleEditReason(e, index)}
                          className="p-2 border rounded w-full"
                        />
                      ) : (
                        point.Reason
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {isEditingPointsKey ? (
                        <input
                          type="number"
                          value={point.Points}
                          onChange={(e) => handleEditPoints(e, index)}
                          className="p-2 border rounded w-full"
                        />
                      ) : (
                        point.Points
                      )}
                    </td>
                    {isEditingPointsKey && (
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => handleDeleteReason(point.Reason_ID)}
                          className="bg-red-500 text-white py-1 px-3 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Add New Row (if in edit mode) */}
            {isEditingPointsKey && (
              <div className="mt-4 flex gap-4">
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="p-2 border rounded w-full"
                  placeholder="New Reason"
                />
                <input
                  type="number"
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                  className="p-2 border rounded w-full"
                  placeholder="Points"
                />
                <button
                  onClick={handleAddReason}
                  className="bg-green-500 text-white py-2 px-4 rounded"
                  disabled={!newReason || !newPoints}
                >
                  Add Reason
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}