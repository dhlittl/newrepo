"use client";
import { useEffect, useState } from "react";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sponsors on page load
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors");
        if (!response.ok) {
          throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
        }
        const data = await response.json();

        const transformedData = data.map((sponsor) => ({
          id: sponsor.Sponsor_Org_ID,
          name: sponsor.Sponsor_Org_Name,
          description: sponsor.Sponsor_Description,
          email: sponsor.Email,
          phone: sponsor.Phone_Number,
        }));

        setSponsors(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSponsors(false);
      }
    };

    fetchSponsors();
  }, []);

  // Fetch policies once when the page loads
  useEffect(() => {
    const fetchPolicies = async () => {
      setLoadingPolicies(true);
      try {
        const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/policies`);
        if (!response.ok) {
          throw new Error(`Failed to fetch policies: ${response.statusText}`);
        }
        const data = await response.json();

        setPolicies(data);
      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoadingPolicies(false);
      }
    };

    fetchPolicies();
  }, []);

  // Handle sponsor selection
  const handleSponsorChange = (e) => {
    const sponsorId = parseInt(e.target.value);
    setSelectedSponsorId(sponsorId);

    // Find and set selected sponsor details
    const sponsor = sponsors.find((s) => s.id === sponsorId);
    setSelectedSponsor(sponsor);
  };

  // Filter policies based on the selected sponsor
  const filteredPolicies = policies.filter(policy => policy.Sponsor_Org_ID === selectedSponsorId);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Our Sponsors</h2>

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
        <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
          <h3 className="text-lg font-semibold text-black">{selectedSponsor.name}</h3>
          <p className="text-gray-700">{selectedSponsor.description}</p>
          <p className="text-gray-700"><strong>Contact:</strong> {selectedSponsor.email}</p>
          <p className="text-gray-700"><strong>Phone:</strong> {selectedSponsor.phone}</p>
          <p className="text-gray-700"><strong>ID:</strong> {selectedSponsor.id}</p>
        </div>
      )}

      {/* Display Sponsor Policies */}
      {selectedSponsorId && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-black">Policies</h2>
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
  );
}