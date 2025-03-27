// app/pages/sponsor/drivers/page.js

"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import "@/amplify-config";

export default function SponsorDrivers() {
  const [sponsorOrgId, setSponsorOrgId] = useState(null);
  const [sponsorId, setSponsorId] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [error, setError] = useState(null);

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
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsor/drivers?sponsorOrgId=${effectiveSponsorId}`
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

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
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
      
      <ul>
        {drivers.map(driver => (
          <li key={driver.Driver_ID} className="p-2 mb-4 bg-gray-50 border rounded-lg shadow-sm">
            <h3>{driver.Driver_Name}</h3>
            <p>Points: {driver.Point_Balance}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
