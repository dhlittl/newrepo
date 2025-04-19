"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PointInfoPage() {
  const router = useRouter();
  const { userId, isAssumed } = useEffectiveDriverId();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pointHistory, setPointHistory] = useState([]);
  const [balances, setBalances] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pointChangeType, setPointChangeType] = useState('all');

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
    fetchPointHistory();
  }, [authorized, userId]);

  const fetchPointHistory = async () => {
    try {
      setLoading(true);
      
      // Make API call to get point history
      let url = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/pointsInfo?userId=${userId}`;
      
      // Add sponsor filter if selected
      if (selectedSponsor !== 'all') {
        url += `&sponsorId=${selectedSponsor}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.point_history && Array.isArray(data.point_history)) {
        setPointHistory(data.point_history);
      }
      
      if (data && data.current_balances && Array.isArray(data.current_balances)) {
        setBalances(data.current_balances);
      }
    } catch (err) {
      console.error("Failed to fetch point history:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Trigger a refresh with the current filters
    fetchPointHistory();
  };

  const filteredHistory = pointHistory.filter(entry => {
    // Apply date range filter
    if (dateRange === 'custom' && (startDate || endDate)) {
      const entryDate = new Date(entry.Change_Date);
      
      if (startDate && new Date(startDate) > entryDate) {
        return false;
      }
      
      if (endDate && new Date(endDate) < entryDate) {
        return false;
      }
    } else if (dateRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (new Date(entry.Change_Date) < oneWeekAgo) {
        return false;
      }
    } else if (dateRange === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      if (new Date(entry.Change_Date) < oneMonthAgo) {
        return false;
      }
    }

    // Apply point change type filter
    if (pointChangeType !== 'all' && entry.Point_Change_Type !== pointChangeType) {
      return false;
    }

    return true;
  });

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading point history...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
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
        <h1 className="text-2xl font-bold">Point History</h1>
        
        <Link href="/pages/driver/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
      
      {/* Current Balances */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Current Point Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map(bal => (
            <div key={bal.Sponsor_Org_ID} className="bg-white p-3 rounded shadow">
              <div className="font-medium">{bal.Sponsor_Org_Name}</div>
              <div className="text-xl font-bold text-blue-600">{bal.Point_Balance.toLocaleString()} points</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Filter Point History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sponsor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
            <select
              value={selectedSponsor}
              onChange={(e) => setSelectedSponsor(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Sponsors</option>
              {balances.map(s => (
                <option key={s.Sponsor_Org_ID} value={s.Sponsor_Org_ID}>
                  {s.Sponsor_Org_Name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </>
          )}
          
          {/* Point Change Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Change Type</label>
            <select
              value={pointChangeType}
              onChange={(e) => setPointChangeType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Changes</option>
              <option value="ADD">Points Added</option>
              <option value="SUB">Points Subtracted</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={applyFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
      
      {/* Point History Table */}
      {filteredHistory.length > 0 ? (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sponsor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((entry, index) => {
                const date = new Date(entry.Change_Date);
                const formattedDate = date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                const formattedTime = date.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formattedDate}</div>
                      <div className="text-sm text-gray-500">{formattedTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.Sponsor_Org_Name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${entry.Point_Change_Type === 'ADD' ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.Point_Change_Type === 'ADD' ? '+' : '-'}{Math.abs(entry.Num_Points).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${entry.Point_Change_Type === 'ADD' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {entry.Point_Change_Type === 'ADD' ? 'Added' : 'Subtracted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.Reason}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          No point history found with the current filters.
        </div>
      )}
    </div>
  );
}