"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession } from "aws-amplify/auth";
import "@/amplify-config";

export default function SponsorDrivers() {
  const [sponsorOrgId, setSponsorOrgId] = useState(null);
  const [sponsorId, setSponsorId] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDriverIds, setSelectedDriverIds] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pointsChange, setPointsChange] = useState("");
  const [reason, setReason] = useState("");

  const [bonusMessage, setBonusMessage] = useState("");
  const [bonusLoading, setBonusLoading] = useState(false);

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

  const toggleDriverSelection = (driverId) => {
    setSelectedDriverIds((prev) =>
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const selectAllDrivers = () => {
    setSelectedDriverIds(drivers.map(driver => driver.Driver_ID));
  };

  const clearSelection = () => {
    setSelectedDriverIds([]);
  };

  const openBulkEditModal = () => {
    if (selectedDriverIds.length === 0) {
      alert("Please select at least one driver.");
      return;
    }
    setPointsChange("");
    setReason("");
    setIsModalOpen(true);
  };

  const handleBulkUpdate = async () => {
    if (!pointsChange || isNaN(pointsChange)) {
      alert("Please enter a valid number for points.");
      return;
    }

    const sponsorUserId = effectiveSponsorId;

    try {
      for (const driverId of selectedDriverIds) {
        const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            Driver_ID: driverId,
            Sponsor_User_ID: sponsorUserId,
            Point_Balance: parseInt(pointsChange),
            Reason: reason
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(`Failed to update Driver ${driverId}: ${errData.error || response.statusText}`);
        }
      }

      alert("Points updated successfully!");
      setIsModalOpen(false);
      setSelectedDriverIds([]);
      setPointsChange("");
      setReason("");

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
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={selectAllDrivers}>Select All</button>
            <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={clearSelection}>Clear Selection</button>
            <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={openBulkEditModal}>Edit Points</button>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              Update Points for Selected Drivers
            </h3>
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