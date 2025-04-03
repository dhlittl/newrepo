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

  const [reasons, setReasons] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [newPoints, setNewPoints] = useState("");

  const [bonusMessage, setBonusMessage] = useState("");
  const [bonusLoading, setBonusLoading] = useState(false);

  const effectiveSponsorId = sponsorId || sponsorOrgId;

  useEffect(() => {
    const getSponsorIdFromUser = async () => {
      try {
        const session = await fetchAuthSession();
        const authSponsorId = session.tokens?.idToken?.payload['custom:sponsorOrgId'];
        if (authSponsorId) setSponsorOrgId(authSponsorId);
      } catch (err) {
        console.error("Error fetching sponsor ID:", err);
        setError("Failed to fetch sponsor ID.");
      }
    };
    if (!sponsorId) getSponsorIdFromUser();
  }, [sponsorId]);

  useEffect(() => {
    fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors")
      .then(res => res.json())
      .then(setSponsors)
      .catch(err => console.error("Error fetching sponsors list:", err));
  }, []);

  useEffect(() => {
    if (!effectiveSponsorId) return;
    fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers?sponsorOrgId=${effectiveSponsorId}`)
      .then(res => res.json())
      .then(setDrivers)
      .catch(err => setError("Error fetching drivers: " + err.message))
      .finally(() => setLoadingDrivers(false));
  }, [effectiveSponsorId]);

  useEffect(() => {
    if (isModalOpen && effectiveSponsorId) {
      fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey?sponsorOrgId=${effectiveSponsorId}`)
        .then(res => res.json())
        .then(setReasons)
        .catch(err => console.error("Error fetching reasons table:", err));
    }
  }, [isModalOpen, effectiveSponsorId]);

  const toggleDriverSelection = (driverId) => {
    setSelectedDriverIds(prev => prev.includes(driverId)
      ? prev.filter(id => id !== driverId)
      : [...prev, driverId]);
  };

  const selectAllDrivers = () => setSelectedDriverIds(drivers.map(d => d.Driver_ID));
  const clearSelection = () => setSelectedDriverIds([]);

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
    try {
      for (const driverId of selectedDriverIds) {
        await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Driver_ID: driverId,
            Sponsor_User_ID: effectiveSponsorId,
            Point_Balance: parseInt(pointsChange),
            Reason: reason
          })
        });
      }
      alert("Points updated successfully!");
      setIsModalOpen(false);
      setSelectedDriverIds([]);
      const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers?sponsorOrgId=${effectiveSponsorId}`);
      const refreshed = await res.json();
      setDrivers(refreshed);
    } catch (err) {
      alert("Error updating points: " + err.message);
    }
  };

  const runWeeklyBonus = async () => {
    if (!effectiveSponsorId) return alert("Sponsor ID not found.");
    setBonusLoading(true);
    try {
      const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "give_weekly_bonus",
          Sponsor_Org_ID: parseInt(effectiveSponsorId),
          week_start: "2025-03-31",
          week_end: "2025-04-06"
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Bonus failed.");
      setBonusMessage("✅ " + result.message);
      const refreshRes = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers?sponsorOrgId=${effectiveSponsorId}`);
      setDrivers(await refreshRes.json());
    } catch (err) {
      setBonusMessage("❌ " + err.message);
    }
    setTimeout(() => setBonusMessage(""), 5000);
    setBonusLoading(false);
  };

  const handleEditPoints = (e, index) => {
    const updated = [...reasons];
    updated[index].Points = e.target.value;
    setReasons(updated);
    const r = updated[index];
    fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reasonId: r.Reason_ID, reason: r.Reason, points: r.Points })
    });
  };

  const handleDeleteReason = async (id) => {
    await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey?Reason_ID=${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    setReasons(reasons.filter(r => r.Reason_ID !== id));
  };

  const handleAddReason = async () => {
    const res = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sponsorOrgId: effectiveSponsorId, reason: newReason, points: newPoints })
    });
    const data = await res.json();
    setReasons([...reasons, data]);
    setNewReason("");
    setNewPoints("");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-lg">
      {/* Sponsor Selector */}
      <div className="max-w-lg mx-auto mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Testing Controls</h2>
        <select className="p-2 border rounded w-full" onChange={(e) => setSponsorId(e.target.value)} value={sponsorId || ''}>
          <option value="">-- Select a Sponsor --</option>
          {sponsors.map(s => <option key={s.Sponsor_Org_ID} value={s.Sponsor_Org_ID}>{s.Sponsor_Org_Name} (ID: {s.Sponsor_Org_ID})</option>)}
        </select>
      </div>

      {/* Driver Table */}
      <h2 className="text-xl font-semibold mb-4 text-black">Your Drivers</h2>
      {loadingDrivers ? <p>Loading drivers...</p> : error ? <p className="text-red-500">{error}</p> : drivers.length === 0 ? <p>No drivers found.</p> : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={selectAllDrivers}>Select All</button>
            <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={clearSelection}>Clear</button>
            <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={openBulkEditModal}>Edit Points</button>
            <button className="bg-green-600 text-white py-2 px-4 rounded" onClick={runWeeklyBonus} disabled={bonusLoading}>
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
                {drivers.map(d => (
                  <tr key={d.Driver_ID} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border text-center">
                      <input type="checkbox" checked={selectedDriverIds.includes(d.Driver_ID)} onChange={() => toggleDriverSelection(d.Driver_ID)} />
                    </td>
                    <td className="py-2 px-4 border">{d.Driver_ID}</td>
                    <td className="py-2 px-4 border">{d.Driver_Name}</td>
                    <td className="py-2 px-4 border">{d.Point_Balance}</td>
                    <td className="py-2 px-4 border">{d.Num_Purchases}</td>
                    <td className="py-2 px-4 border">{d.Point_Goal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[75vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Update Points for Selected Drivers</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="bg-blue-500 text-white py-2 px-4 rounded mb-2">
              {isEditing ? "Save Changes" : "Edit Table"}
            </button>

            {/* Reasons Table */}
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
                {reasons.length > 0 ? reasons.map((r, i) => (
                  <tr key={r.Reason_ID}>
                    <td className="border p-2">{r.Reason}</td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input type="number" value={r.Points} onChange={(e) => handleEditPoints(e, i)} className="p-2 border rounded" />
                      ) : r.Points}
                    </td>
                    <td className="border p-2">{r.Date_Added}</td>
                    {isEditing && (
                      <td className="border p-2">
                        <button onClick={() => handleDeleteReason(r.Reason_ID)} className="bg-red-500 text-white py-1 px-3 rounded">Delete</button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="border p-2 text-center">No reasons found</td></tr>
                )}
              </tbody>
            </table>

            {/* Add Row */}
            {isEditing && (
              <div className="flex gap-4 mb-4">
                <input value={newReason} onChange={(e) => setNewReason(e.target.value)} className="p-2 border rounded w-full" placeholder="New Reason" />
                <input value={newPoints} onChange={(e) => setNewPoints(e.target.value)} className="p-2 border rounded w-full" placeholder="Points" />
                <button onClick={handleAddReason} className="bg-green-500 text-white py-2 px-4 rounded">Add</button>
              </div>
            )}

            <input type="text" value={pointsChange} onChange={(e) => setPointsChange(e.target.value)} className="p-2 border rounded w-full mb-4" placeholder="Enter points change (use negative to subtract)" />
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="p-2 border rounded w-full mb-4" placeholder="Reason for points change" />
            <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleBulkUpdate}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}