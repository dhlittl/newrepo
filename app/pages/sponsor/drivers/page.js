// /pages/sponsor/drivers

"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from 'next/navigation';
import "@/amplify-config";

export default function SponsorDrivers() {
  const [sponsorOrgId, setSponsorOrgId] = useState(null);
  const [sponsorId, setSponsorId] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDriverIds, setSelectedDriverIds] = useState([]);

  // Modal state for bulk edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pointsChange, setPointsChange] = useState(""); // Keep as string for proper input handling

  const [reason, setReason] = useState("");
  const [reasons, setReasons] = useState([]); // store the reasons table

  // For Editing Points_Key table
  const [isEditing, setIsEditing] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [newPoints, setNewPoints] = useState("");

  // Bonus
  const [bonusMessage, setBonusMessage] = useState("");
  const [bonusLoading, setBonusLoading] = useState(false);

  // for testing: was having auth problems trying to test - anna
  const HARD_CODED_SPONSOR_ID = 1;

  useEffect(() => {
    const getSponsorIdFromUser = async () => {
      try {
        const session = await fetchAuthSession();
        const authSponsorId = session.tokens?.idToken?.payload['custom:sponsorOrgId'];
        if (authSponsorId) {
          setSponsorOrgId(authSponsorId);
        }
      } catch (err) {
        console.error("Error fetching sponsor ID:", err);
        setError("Failed to fetch sponsor ID.");
      }
    };
    if (!sponsorId) {
      getSponsorIdFromUser();
    }
  }, [sponsorId]);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors");
        if (!response.ok) {
          throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
        }
        const data = await response.json();
        setSponsors(data);
      } catch (err) {
        console.error("Error fetching sponsors list:", err);
      }
    };
    fetchSponsors();
  }, []);

  const effectiveSponsorId = sponsorId || sponsorOrgId;

  useEffect(() => {
    if (!effectiveSponsorId) return;

    const fetchDrivers = async () => {
      try {
        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers?sponsorOrgId=${effectiveSponsorId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch drivers");
        }
        const data = await response.json();
        setDrivers(data);
      } catch (err) {
        setError("Error fetching drivers: " + err.message);
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, [effectiveSponsorId]);

  // Fetch Reasons table when modal opens
  useEffect(() => {
    if (isModalOpen && effectiveSponsorId) {
      console.log("Fetching reasons for Sponsor Org ID:", effectiveSponsorId);
      fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey?sponsorOrgId=${effectiveSponsorId}`)
        .then(response => response.json())
        .then(data => setReasons(data))
        .catch(error => console.error("Error fetching reasons table:", error));
    }
  }, [isModalOpen, effectiveSponsorId]);

  // Toggle checkbox for each driver row
  const toggleDriverSelection = (driverId) => {
    setSelectedDriverIds((prev) =>
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  // Select all drivers
  const selectAllDrivers = () => {
    setSelectedDriverIds(drivers.map(driver => driver.Driver_ID));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedDriverIds([]);
  };

  // Open modal for bulk edit
  const openBulkEditModal = () => {
    if (selectedDriverIds.length === 0) {
      alert("Please select at least one driver.");
      return;
    }
    setPointsChange("");
    setReason("");
    setIsModalOpen(true);
  };

  // Updated handleBulkUpdate function
  const handleBulkUpdate = async () => {
    if (!pointsChange || isNaN(pointsChange)) {
      alert("Please enter a valid number for points.");
      return;
    }

    const sponsorUserId = parseInt(effectiveSponsorId);
    const pointsChangeValue = parseInt(pointsChange);
    
    try {
      // Get the sponsor name for the email
      const sponsorName = sponsors.find(s => s.Sponsor_Org_ID == effectiveSponsorId)?.Sponsor_Org_Name || "your sponsor";
      
      for (const driverId of selectedDriverIds) {
        // Find the driver's data to get their full information
        const driverInfo = drivers.find(d => d.Driver_ID === driverId);
        if (!driverInfo) {
          console.error(`Could not find data for driver ${driverId}`);
          continue;
        }
        
        // First, update the driver's points
        const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            Driver_ID: driverId,
            Sponsor_Org_ID: sponsorUserId,
            Sponsor_User_ID: sponsorUserId,
            Point_Balance: pointsChangeValue,
            Reason: reason
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(`Failed to update Driver ${driverId}: ${errData.error || response.statusText}`);
        }
        
        // Get the new point balance after update
        const newPointBalance = driverInfo.Point_Balance + pointsChangeValue;
        
        try {
          // Get the driver's email using the GetUserEmail Lambda
          const emailResponse = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Team24-GetUserEmail?userId=${driverInfo.User_ID}`);
          if (!emailResponse.ok) {
            console.error(`Failed to get email for driver ${driverId}`);
            continue;
          }
          
          const emailData = await emailResponse.json();
          const driverEmail = emailData.email;
          
          if (!driverEmail) {
            console.error(`No email found for driver ${driverId}`);
            continue;
          }
          
          // Check notification preferences before sending email
          const preferencesResponse = await fetch(
            `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Team24-DriverNotificationPreferences?userId=${driverInfo.User_ID}`
          );
          
          if (!preferencesResponse.ok) {
            console.error(`Failed to get notification preferences for driver ${driverId}`);
            continue;
          }
          
          const preferencesData = await preferencesResponse.json();
          const pointsNotificationsEnabled = preferencesData.preferences?.Points_Update_Notifications === 1;
          
          if (!pointsNotificationsEnabled) {
            console.log(`Points notifications are disabled for driver ${driverId}, skipping email`);
            continue;
          }
          
          // Prepare email content
          const pointChangeText = pointsChangeValue > 0 
            ? `increased by ${pointsChangeValue}` 
            : `decreased by ${Math.abs(pointsChangeValue)}`;
          
          const emailSubject = `Point Balance Update`;
          
          const emailBody = `
            <html>
              <body>
                <h2>Your Point Balance Has Been Updated</h2>
                <p>Hello ${driverInfo.Driver_Name},</p>
                <p>Your point balance has been ${pointChangeText} by ${sponsorName}.</p>
                <p><strong>Reason:</strong> ${reason || "No reason provided"}</p>
                <p><strong>New Balance:</strong> ${newPointBalance} points</p>
                <hr>
                <p>This is an automated message from the Good Driver Incentive Program.</p>
                <p>You can manage your notification preferences in your account settings</a>.</p>
              </body>
            </html>
          `;
          
          // Send the email notification
          await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recipientEmail: driverEmail,
              emailSubject: emailSubject,
              emailBody: emailBody
            })
          });
          
          console.log(`Notification email sent to driver ${driverId} (${driverEmail})`);
        } catch (emailErr) {
          console.error(`Error sending notification to driver ${driverId}:`, emailErr);
          // Continue with other drivers even if email fails for one
        }
      }

      alert("Points updated successfully!");
      setIsModalOpen(false);
      setSelectedDriverIds([]);
      setPointsChange("");
      setReason("");

      // Refresh the driver list
      const refreshDrivers = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers?sponsorOrgId=${effectiveSponsorId}`
      );
      const refreshedData = await refreshDrivers.json();
      setDrivers(refreshedData);

    } catch (err) {
      console.error("Error updating points:", err);
      alert("Error updating points: " + err.message);
    }
  };

  const runWeeklyBonus = async () => {
    if (!effectiveSponsorId) {
      alert("Sponsor ID not found.");
      return;
    }

    setBonusLoading(true);
    setBonusMessage("");

    try {
      const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "give_weekly_bonus",
          Sponsor_Org_ID: parseInt(effectiveSponsorId),
          week_start: "2025-03-31",
          week_end: "2025-04-06"
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Bonus failed.");
      }

      setBonusMessage("✅ " + result.message);
      setTimeout(() => setBonusMessage(""), 5000);

      const refreshDrivers = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers?sponsorOrgId=${effectiveSponsorId}`
      );
      const refreshedData = await refreshDrivers.json();
      setDrivers(refreshedData);

    } catch (err) {
      console.error("Bonus error:", err);
      setBonusMessage("❌ " + err.message);
      setTimeout(() => setBonusMessage(""), 5000);
    }

    setBonusLoading(false);
  };

  // Functions for handling editing Points_Key table
  // handle editing existing reason
  const handleEditReason = async (reasonData) => {
    const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey?sponsorOrgId=${effectiveSponsorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reasonId: reasonData.Reason_ID,
        reason: reasonData.Reason,
        points: reasonData.Points,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update reason');
    }

    const data = await response.json();
    console.log(data);
  };

  // handle editing existing points
  const handleEditPoints = (e, index) => {
    const updatedReasons = [...reasons];  // copy of current reasons array
    updatedReasons[index].Points = e.target.value;  // update point val
    setReasons(updatedReasons);  // update state
  
    const reasonData = updatedReasons[index];
  
    // PUT request to update the points on the backend
    console.log(reasonData)
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
  
// handle adding new reason
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
        sponsorOrgId: parseInt(effectiveSponsorId),
        reason: newReason,
        points: parseInt(newPoints),
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add reason');
    }
    
    console.log("API Response:", data);
    
    if (data.Reason_ID) {
      setReasons([...reasons, data]);
    } else {
      // fetch the updated list
      const refreshResponse = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey?sponsorOrgId=${effectiveSponsorId}`
      );
      const refreshData = await refreshResponse.json();
      setReasons(refreshData);
    }
    
    // clear input fields after
    setNewReason("");
    setNewPoints("");
  } catch (error) {
    console.error("Error adding new reason:", error);
    alert("Failed to add new reason: " + error.message);
  }
};
  

  // handle deleting reason
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
      setReasons(reasons.filter(reason => reason.Reason_ID !== reasonId));
      
    } catch (error) {
      console.error("Error details:", error);
      alert("Failed to delete reason: " + error.message);
    }
  };


  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-lg">
      <div className="max-w-lg mx-auto mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Testing Controls</h2>
        <p className="mb-3">Select a sponsor to test with:</p>
        <select 
          className="p-2 border rounded w-full"
          onChange={(e) => setSponsorId(e.target.value)}
          value={sponsorId || ''}
        >
          <option value="">-- Select a Sponsor --</option>
          {sponsors.map(sponsor => (
            <option key={sponsor.Sponsor_Org_ID} value={sponsor.Sponsor_Org_ID}>
              {sponsor.Sponsor_Org_Name} (ID: {sponsor.Sponsor_Org_ID})
            </option>
          ))}
        </select>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-black">Your Drivers</h2>
      {loadingDrivers && <p>Loading drivers...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loadingDrivers && drivers.length === 0 && <p>No drivers found for this sponsor.</p>}

      {!loadingDrivers && drivers.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-4">
            <button 
              className="bg-gray-500 text-white py-2 px-4 rounded"
              onClick={selectAllDrivers}
            >
              Select All
            </button>
            <button 
              className="bg-gray-500 text-white py-2 px-4 rounded"
              onClick={clearSelection}
            >
              Clear Selection
            </button>
            <button 
              className="bg-blue-500 text-white py-2 px-4 rounded"
              onClick={openBulkEditModal}
            >
              Edit Points
            </button>
            <button
                className="bg-green-600 text-white py-2 px-4 rounded"
                onClick={runWeeklyBonus}
                disabled={bonusLoading}
              >
                {bonusLoading ? "Running..." : "Give Weekly Bonus"}
              </button>
              {bonusMessage && <p className="text-sm text-gray-700">{bonusMessage}</p>}
            </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border">Select</th>
                  <th className="py-2 px-4 border">Driver ID</th>
                  <th className="py-2 px-4 border">Name</th>
                  <th className="py-2 px-4 border">Points</th>
                  <th className="py-2 px-4 border">Purchases</th>
                  <th className="py-2 px-4 border">Point Goal</th>
                  <th className="py-2 px-4 border">See As Driver</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(driver => (
                  <tr key={driver.Driver_ID} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedDriverIds.includes(driver.Driver_ID)}
                        onChange={() => toggleDriverSelection(driver.Driver_ID)}
                      />
                    </td>
                    <td className="py-2 px-4 border">{driver.Driver_ID}</td>
                    <td className="py-2 px-4 border">{driver.Driver_Name}</td>
                    <td className="py-2 px-4 border">{driver.Point_Balance}</td>
                    <td className="py-2 px-4 border">{driver.Num_Purchases}</td>
                    <td className="py-2 px-4 border">{driver.Point_Goal}</td>
                    <td className="py-2 px-4 border">
                      <button
                        className="bg-blue-600 text-white py-2 px-4 rounded"
                        onClick={() => {
                          sessionStorage.setItem("assumedDriverId", driver.Driver_ID.toString())
                          sessionStorage.setItem("assumedDriverName", driver.Driver_Name);
                          window.location.href = "/pages/driver";
                        }}
                      >
                        Assume Identity
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[75vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Update Points for Selected Drivers
            </h3>

            {/* Toggle Edit Mode */}
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                {isEditing ? "Save Changes" : "Edit Table"}
              </button>
            </div>

            {/* Reasons Table */}
            <h4 className="text-md font-semibold mb-2">Point Change Key</h4>
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Reason</th>
                  <th className="border p-2">Points</th>
                  <th className="border p-2">Date Added</th>
                  {isEditing && <th className="border p-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {reasons.length > 0 ? (
                  reasons.map((reason, index) => (
                    <tr key={reason.Reason_ID}>
                      <td className="border p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={reason.Reason}
                            onChange={(e) => handleEditReason(e, index)}
                            className="p-2 border rounded"
                          />
                        ) : (
                          reason.Reason
                        )}
                      </td>
                      <td className="border p-2">
                        {isEditing ? (
                          <input
                            type="number"
                            value={reason.Points}
                            onChange={(e) => handleEditPoints(e, index)}
                            className="p-2 border rounded"
                          />
                        ) : (
                          reason.Points
                        )}
                      </td>
                      <td className="border p-2">{reason.Date_Added}</td>
                      {isEditing && (
                        <td className="border p-2">
                          <button
                            onClick={() => handleDeleteReason(reason.Reason_ID)}
                            className="bg-red-500 text-white py-1 px-3 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="border p-2 text-center">No reasons found</td>
                  </tr>
                )}
              </tbody>
            </table>


            {/* Add New Row (if in edit mode) */}
            {isEditing && (
              <div className="mb-4 flex gap-4">
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

            <input 
              type="text"
              value={pointsChange}
              onChange={(e) => setPointsChange(e.target.value)}
              className="p-2 border rounded w-full mb-4"
              placeholder="Enter points change (use negative to subtract)"
            />
            <input 
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="p-2 border rounded w-full mb-4"
              placeholder="Reason for points change"
            />
            <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleBulkUpdate}>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}