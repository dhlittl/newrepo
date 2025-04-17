"use client";
import { useEffect, useState } from "react";
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from "@/hooks/useEffectiveDriverId";
import { useRouter } from 'next/navigation';

export default function SponsorsPage() {
  const router = useRouter();
  const [sponsors, setSponsors] = useState([]);
  const { userId, isAssumed } = useEffectiveDriverId();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkGroup = async () => {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.idToken?.payload["cognito:groups"] || [];

        if (groups.includes("driver") || groups.includes("sponsor") || groups.includes("admin")) {
          setAuthorized(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch (err) {
        console.error("Auth error:", err);
        router.replace("/login");
      }
    };
    checkGroup();
  }, [router]);

  useEffect(() => {
    if (!authorized || !userId) return;

    const fetchSponsorsAndPoints = async () => {
      try {
        // Fetch sponsor list
        const sponsorRes = await fetch(
          "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors"
        );
        if (!sponsorRes.ok) throw new Error("Failed to fetch sponsors");
        const sponsorData = await sponsorRes.json();

        // Fetch sponsor points for the user
        const pointsRes = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points?userId=${userId}`
        );
        if (!pointsRes.ok) throw new Error("Failed to fetch sponsor points");
        const pointsData = await pointsRes.json();

        // Combine sponsor info with total points
        const sponsorsWithPoints = sponsorData.map((sponsor) => {
          const match = pointsData.find(p => p.Sponsor_Org_ID === sponsor.Sponsor_Org_ID);
          const totalPoints = match
            ? match.PointsAdded - match.PointsSubbed
            : 0;

          return {
            id: sponsor.Sponsor_Org_ID,
            name: sponsor.Sponsor_Org_Name,
            description: sponsor.Sponsor_Description,
            email: sponsor.Email,
            phone: sponsor.Phone_Number,
            totalPoints,
          };
        });

        setSponsors(sponsorsWithPoints);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchSponsorsAndPoints();
  }, [authorized, userId]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-lg">
      {isAssumed && (
        <button
          className="mb-4 text-sm text-gray-700 underline"
          onClick={() => {
            sessionStorage.removeItem("assumedDriverId");
            sessionStorage.removeItem("assumedDriverName");
            router.push("/pages/sponsor/drivers");
          }}
        >
          ← Return to Sponsor View
        </button>
      )}
      <h2 className="text-2xl font-semibold mb-6 text-black">Our Sponsors</h2>

      {loading && <p className="text-gray-500">Loading sponsors...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && sponsors.length === 0 && (
        <p className="text-gray-500">No sponsors available.</p>
      )}

      {!loading && !error && sponsors.length > 0 && (
        <div className="space-y-6">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="p-4 border rounded-lg shadow-sm bg-gray-50"
            >
              <h3 className="text-lg font-semibold text-black">{sponsor.name}</h3>
              <p className="text-gray-700">{sponsor.description}</p>
              <p className="text-gray-700">
                <strong>Contact:</strong> {sponsor.email}
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> {sponsor.phone}
              </p>
              <p className="mt-4 text-gray-700">
                <strong>Total Points:</strong> {sponsor.totalPoints} pts
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
