"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [sponsorUsers, setSponsorUsers] = useState([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors")
      .then((res) => res.json())
      .then((data) => {
        setSponsors(
          data.map((sponsor) => ({
            id: sponsor.Sponsor_Org_ID,
            name: sponsor.Sponsor_Org_Name,
            description: sponsor.Sponsor_Description,
            email: sponsor.Email,
            phone: sponsor.Phone_Number,
          }))
        );
        setLoadingSponsors(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingSponsors(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedSponsorId) return;
    setLoadingUsers(true);
    fetch(
      `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers?sponsorOrgId=${selectedSponsorId}`
    )
      .then((res) => res.json())
      .then((result) => {
        let users = [];
        if (result.body && typeof result.body === "string") {
          try {
            users = JSON.parse(result.body);
          } catch (e) {
            console.error("Error parsing sponsor users response:", e);
            users = [];
          }
        } else if (Array.isArray(result)) {
          users = result;
        }
        setSponsorUsers(users);
        setLoadingUsers(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingUsers(false);
      });
  }, [selectedSponsorId]);

  const handleSponsorChange = (e) => {
    const sponsorId = parseInt(e.target.value);
    setSelectedSponsorId(sponsorId);
    setSelectedSponsor(sponsors.find((s) => s.id === sponsorId));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">Our Sponsors</h2>
        <Link href="/pages/admin/sponsorRegistration">
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Add New Sponsor Member
          </button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white p-6 shadow-md rounded-lg">
          {loadingSponsors ? (
            <p className="text-gray-500">Loading sponsors...</p>
          ) : sponsors.length === 0 ? (
            <p className="text-gray-500">No sponsors available.</p>
          ) : (
            <div className="mb-4">
              <label className="block text-black font-semibold mb-2">
                Select a Sponsor:
              </label>
              <select
                className="w-full p-2 border rounded-lg text-black"
                value={selectedSponsorId || ""}
                onChange={handleSponsorChange}
              >
                <option value="" disabled>
                  Select a sponsor
                </option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>
                    {sponsor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedSponsor && (
            <div className="p-4 border rounded-lg shadow-sm bg-gray-50 mb-6">
              <h3 className="text-lg font-semibold text-black">
                {selectedSponsor.name}
              </h3>
              <p className="text-gray-700">{selectedSponsor.description}</p>
              <p className="text-gray-700">
                <strong>Contact:</strong> {selectedSponsor.email}
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> {selectedSponsor.phone}
              </p>
              <p className="text-gray-700">
                <strong>ID:</strong> {selectedSponsor.id}
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Sponsor Members</h2>
          {loadingUsers ? (
            <p className="text-gray-500">Loading users...</p>
          ) : sponsorUsers.length === 0 ? (
            <p className="text-gray-500">No members found for this sponsor.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Email</th>
                  <th className="border border-gray-300 p-2">Points Changed</th>
                </tr>
              </thead>
              <tbody>
                {sponsorUsers.map((user) => (
                  <tr key={user.Sponsor_User_ID} className="text-center">
                    <td className="border border-gray-300 p-2">{user.Name}</td>
                    <td className="border border-gray-300 p-2">{user.Email}</td>
                    <td className="border border-gray-300 p-2">{user.Num_Point_Changes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
