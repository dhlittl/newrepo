"use client";
import  React , { useState, useEffect } from 'react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const filteredLogs = logs.filter(log =>
    categoryFilter ? log.Event_Type === categoryFilter : true
  );
  
  const sortedLogs = [...filteredLogs].sort((a, b) =>
    sortOrder === "asc"
      ? new Date(a.Timestamp) - new Date(b.Timestamp)
      : new Date(b.Timestamp) - new Date(a.Timestamp)
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
  
      {/* Filters and Sorting */}
      <div className="flex justify-between mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="Driver Applications">Driver Applications</option>
          <option value="Login Attempts">Login Attempts</option>
          <option value="Password Changes">Password Changes</option>
          <option value="Point Changes">Point Changes</option>
        </select>
  
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-2 border rounded bg-blue-500 text-white"
        >
          Sort by Date ({sortOrder === "asc" ? "Oldest" : "Newest"})
        </button>

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
              <th className="py-2 px-4 border-b text-left">Event Type</th>
              <th className="py-2 px-4 border-b text-left">User ID</th>
              <th className="py-2 px-4 border-b text-left">Action Description</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log) => (
              <tr key={log.Audit_ID} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{new Date(log.Timestamp).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{log.Event_Type}</td>
                <td className="py-2 px-4 border-b">{log.User_ID}</td>
                <td className="py-2 px-4 border-b">{log.Action_Description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
