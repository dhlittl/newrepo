"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SponsorSelectPage() {
  const router = useRouter();
  const { userId, isAssumed } = useEffectiveDriverId();
  const [authorized, setAuthorized] = useState(false);
  const [sponsors, setSponsors] = useState([]);
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
    fetchDriverSponsors();
  }, [authorized, userId]);
  
  const fetchDriverSponsors = async () => {
    setLoading(true);
    try {
      // Fetch the driver's sponsors
      const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/${userId}/sponsors`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Get point balances for each sponsor
      const pointsResponse = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points?userId=${userId}`);
      
      if (!pointsResponse.ok) {
        throw new Error(`Failed to fetch point balances: ${pointsResponse.statusText}`);
      }
      
      const pointsData = await pointsResponse.json();
      
      // Combine the data
      const sponsorsWithPoints = data.map(sponsor => {
        const pointInfo = pointsData.find(p => p.Sponsor_Org_ID === sponsor.Sponsor_Org_ID) || 
                          { Point_Balance: 0, PointsAdded: 0, PointsSubbed: 0 };
        
        return {
          ...sponsor,
          pointBalance: pointInfo.Point_Balance,
          pointsAdded: pointInfo.PointsAdded,
          pointsSubbed: pointInfo.PointsSubbed
        };
      });
      
      setSponsors(sponsorsWithPoints);
    } catch (err) {
      console.error("Error fetching driver sponsors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading your sponsors...</div>;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }
  
  if (sponsors.length === 0) {
    return (
      <div className="container mx-auto p-4">
        {/* Return button for sponsors */}
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
        <h1 className="text-2xl font-bold mb-6">Your Sponsors</h1>
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">You don't have any sponsor relationships yet.</p>
          <p>Apply to join a sponsor program to start earning rewards.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        {/* Return button for sponsors */}
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
        <h1 className="text-2xl font-bold">Your Sponsors</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((sponsor) => (
          <div 
            key={sponsor.Sponsor_Org_ID} 
            className="border rounded-lg overflow-hidden shadow-md"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{sponsor.Sponsor_Org_Name}</h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {sponsor.Sponsor_Description || "No description available"}
              </p>
              
              <div className="bg-blue-100 p-3 rounded-lg mb-4">
                <span className="font-semibold">Your Points Balance: </span>
                <span className="text-lg font-bold text-blue-700">
                  {sponsor.pointBalance.toLocaleString()} points
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Link 
                  href={`/pages/driver/sponsors/${sponsor.Sponsor_Org_ID}/catalog`}
                  className="px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white w-full text-center"
                >
                  View Catalog
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}