"use client";
import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { getCurrentUser } from 'aws-amplify/auth';

export default function PointTrackingPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pointData, setPointData] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("all");
  const [drivers, setDrivers] = useState([]);
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
    const [cognitoSub, setCognitoSub] = useState(null);
      const [userId, setUserId] = useState(null);
      const [sponsorOrgId, setSponsorOrgId] = useState(null);
      const [fetchStatus, setFetchStatus] = useState({
          user: 'idle',
          userId: 'idle',
          orgId: 'idle'
        });

  useEffect(() => {
    const checkGroup = async () => {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.idToken?.payload["cognito:groups"] || [];

        if (groups.includes("sponsor") || groups.includes("admin")) {
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
    if (!authorized) return;
    fetchPointData();
  }, [authorized]);


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
      

          const fetchPointData = async () => {
            if (authorized && sponsorOrgId) {
              try {
                setLoading(true);
                const response = await fetch(
                  `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/PointTracking?SponsorOrgId=${sponsorOrgId}`
                );
                const data = await response.json();
          
                // Check if the data is correctly structured
                const parsed = Array.isArray(data.data) ? data.data : []; // Use data.data to get the actual records
                console.log("Fetched Data:", parsed); // Log the response to verify
          
                if (!Array.isArray(parsed)) {
                  console.error("Fetched data is not an array:", parsed);
                  return; // Exit if data is not an array
                }
          
                setPointData(parsed);
          
                // Extract unique drivers
                const uniqueDrivers = [
                  ...new Map(parsed.map((entry) => [`${entry.DriverFirstName} ${entry.DriverLastName}`, entry])).values()
                ];
                setDrivers(uniqueDrivers);
              } catch (err) {
                console.error("Failed to fetch point data:", err);
              } finally {
                setLoading(false);
              }
            }
          };
          

// Use effect to call it once everything is ready
useEffect(() => {
  if (authorized && sponsorOrgId) {
    fetchPointData();
  }
}, [authorized, sponsorOrgId]);

  const applyFilters = () => {
    return pointData.filter((entry) => {
      if (
        selectedDriver !== "all" &&
        `${entry.DriverFirstName} ${entry.DriverLastName}` !== selectedDriver
      ) {
        return false;
      }

      const entryDate = new Date(entry.Change_Date);

      if (dateRange === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (entryDate < oneWeekAgo) return false;
      } else if (dateRange === "month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        if (entryDate < oneMonthAgo) return false;
      } else if (dateRange === "custom") {
        if (startDate && new Date(startDate) > entryDate) return false;
        if (endDate && new Date(endDate) < entryDate) return false;
      }

      return true;
    });
  };

  const filteredData = applyFilters();

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Driver Point Tracking</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-100 p-4 rounded">
        {/* Driver Filter */}
        <div>
          <label className="block mb-1 text-sm font-medium">Driver</label>
          <select
            className="w-full border rounded p-2"
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
          >
            <option value="all">All Drivers</option>
            {drivers.map((d, i) => (
              <option key={i} value={`${d.DriverFirstName} ${d.DriverLastName}`}>
                {d.DriverFirstName} {d.DriverLastName}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block mb-1 text-sm font-medium">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Date Inputs */}
        {dateRange === "custom" && (
          <>
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Total Points</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Change</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Sponsor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Reason</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((entry, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{entry.DriverFirstName} {entry.DriverLastName}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{entry.TotalPoints}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={entry.Point_Change_Type === "ADD" ? "text-green-600" : "text-red-600"}>
                    {entry.Point_Change_Type === "ADD" ? "+" : "-"}{entry.Num_Points}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.Point_Change_Type === "ADD" ? "Added" : "Subtracted"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(entry.Change_Date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.SponsorFirstName} {entry.SponsorLastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.Reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
