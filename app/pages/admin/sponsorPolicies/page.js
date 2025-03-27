"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
// Import your auth helper – adjust the import as needed based on your project setup
import { fetchAuthSession } from '@aws-amplify/auth'; // Adjust if needed

// Helper function to get the Cognito ID token
const getAuthToken = async () => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    // Return the raw JWT token if available
    if (idToken) {
      return idToken.jwtToken;
    }
  } catch (error) {
    console.error("Error fetching auth token:", error);
  }
  return null;
};

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [sponsorUsers, setSponsorUsers] = useState([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sponsors on page load
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors");
        if (!response.ok) throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
        const data = await response.json();
        setSponsors(
          data.map((sponsor) => ({
            id: sponsor.Sponsor_Org_ID,
            name: sponsor.Sponsor_Org_Name,
            description: sponsor.Sponsor_Description,
            email: sponsor.Email,
            phone: sponsor.Phone_Number,
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSponsors(false);
      }
    };

    fetchSponsors();
  }, []);

  // Fetch policies on page load
  useEffect(() => {
    const fetchPolicies = async () => {
      setLoadingPolicies(true);
      try {
        const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/policies");
        if (!response.ok) throw new Error(`Failed to fetch policies: ${response.statusText}`);
        setPolicies(await response.json());
      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoadingPolicies(false);
      }
    };

    fetchPolicies();
  }, []);

  // Fetch sponsor users when a sponsor is selected
  useEffect(() => {
    if (!selectedSponsorId) return;

    const fetchSponsorUsers = async () => {
      setLoadingUsers(true);
      try {
        // Get the Cognito authentication token
        const token = await getAuthToken();
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/users?sponsorOrgId=${selectedSponsorId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorDetails = await response.text(); // Get error details from response body
          throw new Error(`Failed to fetch sponsor users: ${response.status} - ${errorDetails}`);
        }

        const data = await response.json();
        setSponsorUsers(data);
      } catch (error) {
        console.error("Error fetching sponsor users:", error);
        setError(error.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchSponsorUsers();
  }, [selectedSponsorId]);

  // Handle sponsor selection
  const handleSponsorChange = (e) => {
    const sponsorId = parseInt(e.target.value);
    setSelectedSponsorId(sponsorId);
    setSelectedSponsor(sponsors.find((s) => s.id === sponsorId));
  };

  // Filter policies based on the selected sponsor
  const filteredPolicies = policies.filter((policy) => policy.Sponsor_Org_ID === selectedSponsorId);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">Our Sponsors</h2>
        <Link href="/pages/admin/sponsorRegistration">
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Add New Sponsor Member
          </button>
        </Link>
      </div>

      {/* Main Content Layout: Two Columns */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Sponsor Details and Policies */}
        <div className="flex-1 bg-white p-6 shadow-md rounded-lg">
          {/* Loading/Error Handling for Sponsors */}
          {loadingSponsors && <p className="text-gray-500">Loading sponsors...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loadingSponsors && sponsors.length === 0 && <p className="text-gray-500">No sponsors available.</p>}

          {/* Sponsor Selection Dropdown */}
          {!loadingSponsors && sponsors.length > 0 && (
            <div className="mb-4">
              <label className="block text-black font-semibold mb-2">Select a Sponsor:</label>
              <select
                className="w-full p-2 border rounded-lg text-black"
                value={selectedSponsorId || ""}
                onChange={handleSponsorChange}
              >
                <option value="" disabled>Select a sponsor</option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>
                    {sponsor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Display Selected Sponsor Details */}
          {selectedSponsor && (
            <div className="p-4 border rounded-lg shadow-sm bg-gray-50 mb-6">
              <h3 className="text-lg font-semibold text-black">{selectedSponsor.name}</h3>
              <p className="text-gray-700">{selectedSponsor.description}</p>
              <p className="text-gray-700"><strong>Contact:</strong> {selectedSponsor.email}</p>
              <p className="text-gray-700"><strong>Phone:</strong> {selectedSponsor.phone}</p>
              <p className="text-gray-700"><strong>ID:</strong> {selectedSponsor.id}</p>
            </div>
          )}

          {/* Display Sponsor Policies */}
          {selectedSponsorId && (
            <div>
              <h2 className="text-lg font-semibold text-black mb-2">Policies</h2>
              {loadingPolicies ? (
                <p className="text-gray-500">Loading policies...</p>
              ) : filteredPolicies.length === 0 ? (
                <p className="text-gray-500">No policies available for this sponsor.</p>
              ) : (
                <ul className="list-disc list-inside bg-gray-50 p-4 rounded-lg">
                  {filteredPolicies.map((policy) => (
                    <li key={policy.Policy_ID} className="text-gray-700">
                      {policy.Policy_Description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sponsor Users */}
        <div className="flex-1 bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Sponsor Members</h2>
          {loadingUsers ? (
            <p className="text-gray-500">Loading users...</p>
          ) : sponsorUsers.length === 0 ? (
            <p className="text-gray-500">No members found for this sponsor.</p>
          ) : (
            <ul className="space-y-2">
              {sponsorUsers.map((user) => (
                <li key={user.User_ID} className="p-2 bg-gray-100 rounded-lg">
                  <p className="text-black font-medium">{user.FName} {user.LName}</p>
                  <p className="text-gray-700">{user.Email}</p>
                  <p className="text-gray-700">Points Changed: {user.Num_Point_Changes}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
