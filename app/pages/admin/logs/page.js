"use client";
import React, { useState, useEffect } from 'react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sponsorMap, setSponsorMap] = useState({});

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/Logs`);
        const data = await response.json();
        console.log("Full response data:", data);
        console.log("data.logs =", data.logs);
        console.log("Is Array?", Array.isArray(data.logs));
        setLogs(data.logs);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to load logs.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchLogs();
  }, []);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // helper function for time zone
  const createDateForComparison = (dateString, isEndOfDay = false) => {
    if (!dateString) return null;
    
    const [year, month, day] = dateString.split('-').map(Number);
    
    const date = new Date(year, month - 1, day);
    
    if (isEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    
    return date;
  };

  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.Timestamp);
    
    const startDateObj = startDate ? createDateForComparison(startDate, false) : null;
    const endDateObj = endDate ? createDateForComparison(endDate, true) : null;
    
    // debug output to check date handling
    if (logDate.getDate() === new Date().getDate() && logDate.getMonth() === new Date().getMonth()) {
      console.log('Today log:', logDate);
      console.log('Selected end date value:', endDate);
      console.log('End date for filtering:', endDateObj);
      console.log('Is within end date range?', !endDateObj || logDate <= endDateObj);
    }
    
    // filter by category and sponsor match
    const isCategoryMatch = categoryFilter ? log.Event_Type === categoryFilter : true;
    const isSponsorMatch = sponsorFilter ? log.Target_ID?.toString().trim() === sponsorFilter : true;
    
    // filter by date range - only apply if dates are selected
    const isAfterStart = startDateObj ? logDate >= startDateObj : true;
    const isBeforeEnd = endDateObj ? logDate <= endDateObj : true;
  
    return isCategoryMatch && isSponsorMatch && isAfterStart && isBeforeEnd;
  });
  
  const sortedLogs = [...filteredLogs].sort((a, b) =>
    sortOrder === "asc"
      ? new Date(a.Timestamp) - new Date(b.Timestamp)
      : new Date(b.Timestamp) - new Date(a.Timestamp)
  );

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors');
        const data = await response.json();
        console.log("Sponsor API response data:", data);

        const map = {};
        data.forEach((sponsor) => {
          const sponsorId = sponsor.Sponsor_Org_ID?.toString().trim();
          const sponsorName = sponsor.Sponsor_Org_Name?.trim();
          if (sponsorId && sponsorName) {
            map[sponsorId] = sponsorName;
          }
        });
        
        setSponsorMap(map);
      } catch (err) {
        console.error("Error fetching sponsors:", err);
      }
    };
  
    fetchSponsors();
  }, []);

  // display date string
  const formatDateString = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="p-4 w-full max-w-7xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
  
      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2 border rounded bg-blue-500 text-white"
            >
            Sort by Date ({sortOrder === "asc" ? "Oldest" : "Newest"})
          </button>
          
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setCategoryFilter("");
              setSponsorFilter("");
            }}
            className="p-2 border rounded bg-gray-200"
          >
            Clear Filters
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="p-2 border rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="p-2 border rounded"
            />
          </div>
        </div>

        <button
          onClick={() => window.open("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/Logs?format=csv", "_blank")}
          className="p-2 border rounded bg-green-500 text-white"
        >
          Download CSV
        </button>
      </div>
  
      {/* Log Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Timestamp</th>
            
            {/* Event Type with filter */}
            <th className="py-2 px-4 border-b text-left">
              <div className="flex flex-col">
                <span>Event Type</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mt-1 p-1 border rounded text-sm"
                >
                  <option value="">All</option>
                  <option value="Driver Applications">Driver Applications</option>
                  <option value="Login Attempts">Login Attempts</option>
                  <option value="Password Changes">Password Changes</option>
                  <option value="Point Changes">Point Changes</option>
                </select>
              </div>
            </th>

            <th className="py-2 px-4 border-b text-left">User ID</th>

            {/* Sponsor Organization with filter */}
            <th className="py-2 px-4 border-b text-left">
              <div className="flex flex-col">
                <span>Sponsor</span>
                <select
                  value={sponsorFilter}
                  onChange={(e) => setSponsorFilter(e.target.value)}
                  className="mt-1 p-1 border rounded text-sm"
                >
                  <option value="">All</option>
                  {Object.entries(sponsorMap).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
            </th>

            <th className="py-2 px-4 border-b text-left">Action Description</th>
          </tr>
        </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-4 text-center">Loading logs...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-red-500">{error}</td>
              </tr>
            ) : sortedLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-center">No logs match your filters</td>
              </tr>
            ) : (
              sortedLogs.map((log) => (
                <tr key={log.Audit_ID} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{new Date(log.Timestamp).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{log.Event_Type}</td>
                  <td className="py-2 px-4 border-b">{log.User_ID}</td>
                  <td className="py-2 px-4 border-b">
                    {sponsorMap[log.Target_ID?.toString().trim()]}
                  </td>
                  <td className="py-2 px-4 border-b">{log.Action_Description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        {logs.length > 0 && (
          <div>Total logs: {logs.length} | Filtered logs: {sortedLogs.length}</div>
        )}
      </div>
    </div>
  );
}