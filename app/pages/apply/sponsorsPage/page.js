"use client";
import { useEffect, useState } from "react";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
      const fetchSponsors = async () => {
        try {
          const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors");
          if(!response.ok) {
            throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
          }
          const data = await response.json();

          console.log("API Response:", data);

          const transformedData = data.map((sponsor) => ({
            id: sponsor.Sponsor_Org_ID,
            name: sponsor.Sponsor_Org_Name,
            description: sponsor.Sponsor_Description,
            num_drivers: sponsor.Num_Drivers,
            email: sponsor.Email,
            phone: sponsor.Phone_Number,
          }));

          setSponsors(transformedData);
        }catch (err) {
          setError(err.message);
        }finally {
          setLoading(false);
        }
      };
  
      fetchSponsors();
    }, []);
  
    return (
      <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-black">Our Sponsors</h2>
  
        {loading && <p className="text-gray-500">Loading sponsors...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && sponsors.length === 0 && (
          <p className="text-gray-500">No sponsors available.</p>
        )}
  
        {!loading && !error && sponsors.length > 0 && (
          <div className="space-y-4">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                <h3 className="text-lg font-semibold text-black">{sponsor.name}</h3>
                <p className="text-gray-700">{sponsor.description}</p>
                <p className="text-gray-700"><strong>Contact:</strong> {sponsor.email}</p>
                <p className="text-gray-700"><strong>Phone:</strong> {sponsor.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
