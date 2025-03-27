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
          <option value="Login">Login</option>
          <option value="Logout">Logout</option>
          <option value="Update">Update</option>
          <option value="Delete">Delete</option>
        </select>
  
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-2 border rounded bg-blue-500 text-white"
        >
          Sort by Date ({sortOrder === "asc" ? "Oldest" : "Newest"})
        </button>
      </div>
  
      {/* Log Entries */}
      <ul className="space-y-2">
        {sortedLogs.map((log) => (
          <li key={log.Audit_ID} className="p-2 border-b">
            <span className="font-semibold">{new Date(log.Timestamp).toLocaleString()}</span>{" "}
            – <span className="font-medium">{log.Event_Type}</span>: {log.Action_Description}
          </li>
        ))}
      </ul>
    </div>
  );
}
