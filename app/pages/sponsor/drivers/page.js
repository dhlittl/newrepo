// app/pages/sponsor/drivers/page.js

"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import "@/amplify-config";

export default function SponsorDashboard() {
  const [sponsorOrgId, setSponsorOrgId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sponsor ID from the authenticated user
  useEffect(() => {
    const getSponsorIdFromUser = async () => {
      try {
        const user = await getCurrentUser(); // Fetch authenticated user
        const session = await fetchAuthSession(); // Fetch session tokens
  
        // Check ID token payload for custom attributes
        const sponsorId = session.tokens?.idToken?.payload['custom:sponsorOrgId'];
        if (sponsorId) {
          setSponsorOrgId(sponsorId);
        } else {
          throw new Error("Sponsor ID not found in user attributes.");
        }
      } catch (err) {
        console.error("Error fetching sponsor ID:", err);
        setError("Failed to fetch sponsor ID.");
      }
    };
  
    getSponsorIdFromUser();
  }, []);
  // Fetch drivers based on the sponsor ID
  useEffect(() => {
    if (!sponsorOrgId) return;

    const fetchDrivers = async () => {
      try {
        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsor/drivers?sponsorOrgId=${sponsorOrgId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }
        const data = await response.json();
        setDrivers(data); // Set drivers data
      } catch (err) {
        setError('Error fetching drivers: ' + err.message);
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, [sponsorOrgId]); // Only trigger fetch when sponsorOrgId is set

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Your Drivers</h2>

      {loadingDrivers && <p>Loading drivers...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loadingDrivers && drivers.length === 0 && <p>No drivers found for this sponsor.</p>}

      <ul>
        {drivers.map(driver => (
          <li key={driver.Driver_ID} className="p-2 mb-4 bg-gray-50 border rounded-lg shadow-sm">
            <h3>{driver.Driver_Name}</h3>
            <p>Points: {driver.Point_Balance}</p>
            {/* Add more driver details here */}
          </li>
        ))}
      </ul>
    </div>
  );
}
