// Sponsor Users Page
// sponsors can see associated users and add more if needed

"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';

export default function SponsorsList() {
    const [sponsors, setSponsors] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'User_ID', direction: 'asc' });
    const [expandedRows, setExpandedRows] = useState([]); 
    const [expandedDetails, setExpandedDetails] = useState({});
    const [sponsorOrgId, setSponsorOrgId] = useState(null);
    const [cognitoSub, setCognitoSub] = useState(null);
    const [userId, setUserId] = useState(null);


 
    // fetch current user (gets coginto_sub)
    useEffect(() => {
        async function fetchUser() {
            try {
            const user = await getCurrentUser();
            setCognitoSub(user.userId);
                
            console.log("Fetched Cognito user ID:", user.userId);
            } catch (error) {
            console.error("Error fetching current user:", error);
            }
        }

        fetchUser();
    }, []);

    // fetch user_id based off cognito sub
    // Step 2: Get database userId based on Cognito sub
    useEffect(() => {
        if (!cognitoSub) return;
    
        async function fetchUserId() {
        try {
            const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${cognitoSub}`);
            const data = await response.json();
    
            if (response.ok && data.userId) {
            setUserId(data.userId);
            console.log("Database User ID:", data.userId);
            } else {
            console.error("Error fetching database user ID:", data.error || "Unknown error");
            }
        } catch (error) {
            console.error("Error in user ID mapping:", error);
        }
        }
    }, [cognitoSub]);

    // gets sponsor org id from user id
    useEffect(() => {
        if (!userId) return;
    
        async function fetchSponsorOrg() {
        try {
            const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/user/${userId}`);
            const data = await res.json();
    
            if (data?.Sponsor_Org_ID) {
            setSponsorOrgId(data.Sponsor_Org_ID);
            console.log("Sponsor Org ID:", data.Sponsor_Org_ID);
            }
        } catch (error) {
            console.error("Error fetching sponsor org info:", error);
        }
        }
    
        fetchSponsorOrg();
    }, [userId]);
  
  


    useEffect(() => {
    const fetchSponsorsFromSameOrg = async () => {
        try {
        const sameOrgRes = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers?SponsorOrgId=${sponsorOrgId}`);
        const sameOrgData = await sameOrgRes.json();
        const sponsorsArray = sameOrgData.body ? JSON.parse(sameOrgData.body) : sameOrgData;
    
        setSponsors(sponsorsArray);
        } catch (err) {
        console.error("Error fetching sponsors from same org:", err);
        } finally {
        setLoading(false);
        }
    };
    
    if (sponsorOrgId) {
        fetchSponsorsFromSameOrg();
    }
    }, [sponsorOrgId]);


      


  if (loading) {
    return <div className="p-4">Loading sponsors...</div>;
  }

  // Sorting the sponsors
  const sortedSponsors = [...sponsors].sort((a, b) => {
    let aKey = a[sortConfig.key];
    let bKey = b[sortConfig.key];

    if (sortConfig.key === 'Start_Date') {
      aKey = new Date(aKey);
      bKey = new Date(bKey);
    }
    if (aKey < bKey) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aKey > bKey) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Toggle sort configuration when a header is clicked
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper to display sort indicator (active: ▲/▼, inactive: ⇅)
  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '⇅';
  };

  // Fetch additional details for a sponsor
  const fetchSponsorDetails = async (user) => {
    try {
      const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Sponsor/getSponsorDetails?userId=${user.User_ID}`);
      const data = await res.json();
      const details = data.body ? JSON.parse(data.body) : data;
      return details;
    } catch (error) {
      console.error('Error fetching additional details:', error);
      return null;
    }
  };

  // Toggle expansion of a row. If not expanded, fetch the details.
  const toggleRowExpansion = async (user) => {
    if (expandedRows.includes(user.User_ID)) {
      setExpandedRows(expandedRows.filter(id => id !== user.User_ID));
    } else {
      if (!expandedDetails[user.User_ID]) {
        const details = await fetchSponsorDetails(user);
        setExpandedDetails(prev => ({ ...prev, [user.User_ID]: details }));
      }
      setExpandedRows([...expandedRows, user.User_ID]);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sponsors in Your Organization</h1>
      
      {/* Add Sponsor Button */}
      <div className="mb-4">
        <Link href="/pages/sponsor/CreateSponsorAccount">
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Add New Sponsor
          </button>
        </Link>
      </div>
      
      {/* Organization Info */}
      {sponsorOrgId && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold">Organization ID: {sponsorOrgId}</h2>
        </div>
        )}

      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th onClick={() => requestSort('User_ID')} className="border p-2 cursor-pointer" title="Click to sort">
                User ID {renderSortIndicator('User_ID')}
              </th>
              <th onClick={() => requestSort('FName')} className="border p-2 cursor-pointer" title="Click to sort">
                First Name {renderSortIndicator('FName')}
              </th>
              <th onClick={() => requestSort('LName')} className="border p-2 cursor-pointer" title="Click to sort">
                Last Name {renderSortIndicator('LName')}
              </th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone Number</th>
              <th onClick={() => requestSort('Start_Date')} className="border p-2 cursor-pointer" title="Click to sort">
                Start Date {renderSortIndicator('Start_Date')}
              </th>
              <th className="border p-2">End Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedSponsors.map((sponsor) => (
              <React.Fragment key={sponsor.User_ID}>
                <tr onClick={() => toggleRowExpansion(sponsor)} className="cursor-pointer hover:bg-gray-100">
                  <td className="border p-2">{sponsor.User_ID}</td>
                  <td className="border p-2">{sponsor.FName}</td>
                  <td className="border p-2">{sponsor.LName}</td>
                  <td className="border p-2">{sponsor.Email}</td>
                  <td className="border p-2">{sponsor.Phone_Number}</td>
                  <td className="border p-2">{sponsor.Start_Date}</td>
                  <td className="border p-2">{sponsor.End_Date || 'N/A'}</td>
                </tr>
                {expandedRows.includes(sponsor.User_ID) && (
                  <tr className="bg-gray-50">
                    <td className="border p-2" colSpan={7}>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                        <p><strong>Username:</strong> {sponsor.Username || 'N/A'}</p>
                        
                        {expandedDetails[sponsor.User_ID] ? (
                          <div className="mt-2">
                            <p><strong>Sponsor Org ID:</strong> {expandedDetails[sponsor.User_ID].Sponsor_Org_ID}</p>
                            <p><strong>Number of Point Changes:</strong> {expandedDetails[sponsor.User_ID].Num_Point_Changes || 0}</p>
                            {/* Add any other sponsor-specific fields here */}
                          </div>
                        ) : (
                          <p>Loading additional details...</p>
                        )}
                        
                        <div className="mt-4 space-x-2">
                          <Link href={`/pages/sponsor/UpdateSponsorInfo?userId=${sponsor.User_ID}`}>
                            <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                              Update Sponsor Info
                            </button>
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}