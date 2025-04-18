// Sponsor Users Page
// sponsors can see associated users and add more if needed

"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';

export default function SponsorsList() {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'User_ID', direction: 'asc' });
    const [expandedRows, setExpandedRows] = useState([]); 
    const [expandedDetails, setExpandedDetails] = useState({});
    const [sponsorOrgId, setSponsorOrgId] = useState(null);
    const [cognitoSub, setCognitoSub] = useState(null);
    const [userId, setUserId] = useState(null);
    const [fetchStatus, setFetchStatus] = useState({
        user: 'pending',
        userId: 'pending',
        orgId: 'pending',
        sponsors: 'pending'
    });

    // fetch current user (gets cognito_sub)
    useEffect(() => {
        async function fetchUser() {
            try {
                setFetchStatus(prev => ({...prev, user: 'loading'}));
                const user = await getCurrentUser();
                setCognitoSub(user.userId);
                console.log("Fetched Cognito user ID:", user.userId);
                setFetchStatus(prev => ({...prev, user: 'success'}));
            } catch (error) {
                console.error("Error fetching current user:", error);
                setFetchStatus(prev => ({...prev, user: 'error'}));
                setError("Failed to authenticate user. Please try again or contact support.");
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    // fetch user_id based off cognito sub
    useEffect(() => {
        if (!cognitoSub) return;
    
        async function fetchUserId() {
            try {
                setFetchStatus(prev => ({...prev, userId: 'loading'}));
                const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${cognitoSub}`);
                const data = await response.json();
        
                if (response.ok && data.userId) {
                    setUserId(data.userId);
                    console.log("Database User ID:", data.userId);
                    setFetchStatus(prev => ({...prev, userId: 'success'}));
                } else {
                    console.error("Error fetching database user ID:", data.error || "Unknown error");
                    setFetchStatus(prev => ({...prev, userId: 'error'}));
                    setError("Could not find your user account. Please contact an administrator.");
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error in user ID mapping:", error);
                setFetchStatus(prev => ({...prev, userId: 'error'}));
                setError("Failed to retrieve user information. Please try again later.");
                setLoading(false);
            }
        }
        
        fetchUserId();
    }, [cognitoSub]);

    // gets sponsor org id from user id
    useEffect(() => {
        if (!userId) return;
    
        async function fetchSponsorOrg() {
            try {
                setFetchStatus(prev => ({...prev, orgId: 'loading'}));
                const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers/Info?userId=${userId}`);
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch sponsor org with status: ${res.status}`);
                }
                
                const data = await res.json();
                console.log("Sponsor org API response:", data);
        
                if (data?.Sponsor_Org_ID) {
                    setSponsorOrgId(data.Sponsor_Org_ID);
                    console.log("Sponsor Org ID:", data.Sponsor_Org_ID);
                    setFetchStatus(prev => ({...prev, orgId: 'success'}));
                } else {
                    console.error("No Sponsor_Org_ID found in response:", data);
                    setFetchStatus(prev => ({...prev, orgId: 'error'}));
                    setError("You don't appear to be associated with a sponsor organization.");
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching sponsor org info:", error);
                setFetchStatus(prev => ({...prev, orgId: 'error'}));
                setError("Failed to retrieve your sponsor organization. Please contact support.");
                setLoading(false);
            }
        }
    
        fetchSponsorOrg();
    }, [userId]);

    // Fetch sponsors in same organization
    useEffect(() => {
        if (!sponsorOrgId) return;
    
        const fetchSponsorsFromSameOrg = async () => {
            try {
                setFetchStatus(prev => ({...prev, sponsors: 'loading'}));
                console.log("Fetching sponsors with org ID:", sponsorOrgId);
                
                const sameOrgRes = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers?sponsorOrgId=${sponsorOrgId}`);
                console.log("Response status:", sameOrgRes.status);
                
                if (!sameOrgRes.ok) {
                    throw new Error(`Failed to fetch sponsors with status: ${sameOrgRes.status}`);
                }
                
                const sameOrgData = await sameOrgRes.json();
                console.log("Raw sponsors data:", sameOrgData);
                
                let sponsorsArray;
                if (sameOrgData.body && typeof sameOrgData.body === 'string') {
                    try {
                        sponsorsArray = JSON.parse(sameOrgData.body);
                    } catch (parseError) {
                        console.error("Error parsing response body:", parseError);
                        throw new Error("Invalid response format");
                    }
                } else if (Array.isArray(sameOrgData)) {
                    sponsorsArray = sameOrgData;
                } else if (sameOrgData.body && Array.isArray(sameOrgData.body)) {
                    sponsorsArray = sameOrgData.body;
                } else {
                    console.error("Unexpected response format:", sameOrgData);
                    throw new Error("Invalid response structure");
                }

                // Split the "Name" field into "FName" and "LName"
                const sponsorsWithNames = sponsorsArray.map(sponsor => {
                    const [FName, ...LNameParts] = sponsor.Name.split(' ');
                    const LName = LNameParts.join(' ');
                    return { ...sponsor, FName, LName };
                });

                setSponsors(sponsorsWithNames);

                //console.log("from the set sponsors statement 157:", sponsorsWithNames);
                console.log("Parsed sponsors array:", sponsorsArray);
                setFetchStatus(prev => ({...prev, sponsors: 'success'}));
            } catch (err) {
                console.error("Error fetching sponsors from same org:", err);
                setFetchStatus(prev => ({...prev, sponsors: 'error'}));
                setError("Failed to retrieve sponsors list. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchSponsorsFromSameOrg();
    }, [sponsorOrgId]);

    // Safety timeout to prevent infinite loading
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.log("Loading timed out - forcing loading state to false");
                setLoading(false);
                if (!error) {
                    setError("Loading timed out. There might be an issue with the server connection.");
                }
            }
        }, 10000); // 10 seconds timeout
    
        return () => clearTimeout(timeoutId);
    }, [loading, error]);

    // Sorting the sponsors
    const sortedSponsors = [...(sponsors || [])].sort((a, b) => {
        if (!a || !b) return 0;
        
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

    // fetch sponsor details
    const fetchSponsorDetails = async (user) => {
      try {
          const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Sponsor/getSponsorDetails?userId=${user.User_ID}`);
          const data = await res.json();
          const details = data.body ? JSON.parse(data.body) : data;
  
          // Log the details to see if we are getting the correct data
          console.log('Fetched sponsor details:', details);
          
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

    // Conditional rendering for loading state with detailed feedback
    if (loading) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Loading sponsors...</h1>
                <div className="space-y-2">
                    <p>Status:</p>
                    <ul className="list-disc pl-5">
                        <li>Authentication: {fetchStatus.user === 'success' ? '✅' : fetchStatus.user === 'loading' ? '⏳' : '❌'}</li>
                        <li>User ID lookup: {fetchStatus.userId === 'success' ? '✅' : fetchStatus.userId === 'loading' ? '⏳' : '❌'}</li>
                        <li>Organization lookup: {fetchStatus.orgId === 'success' ? '✅' : fetchStatus.orgId === 'loading' ? '⏳' : '❌'}</li>
                        <li>Sponsors list: {fetchStatus.sponsors === 'success' ? '✅' : fetchStatus.sponsors === 'loading' ? '⏳' : '❌'}</li>
                    </ul>
                    {cognitoSub && <p className="mt-2 text-sm text-gray-500">Cognito ID: {cognitoSub}</p>}
                    {userId && <p className="text-sm text-gray-500">User ID: {userId}</p>}
                    {sponsorOrgId && <p className="text-sm text-gray-500">Organization ID: {sponsorOrgId}</p>}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Error Loading Sponsors</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
                <div className="mt-4">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!sponsors || sponsors.length === 0) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Sponsors in Your Organization</h1>
                <p className="mb-4">No sponsors found for organization ID: {sponsorOrgId || 'Unknown'}</p>
                
                {/* Add Sponsor Button */}
                <div className="mt-4">
                    <Link href="/pages/sponsor/CreateSponsorAccount">
                        <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                            Add New Sponsor
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    // Main component render with data
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
                    <p>Total Sponsors: {sponsors.length}</p>
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
                                                    <div className="mt-2 space-y-1">
                                                        {Object.entries(expandedDetails[sponsor.User_ID]).map(([key, value]) => (
                                                            <p key={key}>
                                                                <strong>{key}:</strong> {value !== null && value !== undefined ? value.toString() : 'N/A'}
                                                            </p>
                                                        ))}
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