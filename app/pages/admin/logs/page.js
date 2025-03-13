"use client";
import  React , { useState } from 'react';
const dummyLogs = [
  { id: 1, date: "2025-03-10", category: "Login", description: "User admin logged in." },
  { id: 2, date: "2025-03-11", category: "Update", description: "User updated profile info." },
  { id: 3, date: "2025-03-09", category: "Logout", description: "User admin logged out." },
  { id: 4, date: "2025-03-08", category: "Delete", description: "User deleted an entry." },
  { id: 5, date: "2025-03-11", category: "Login", description: "User driver123 logged in." },
  { id: 6, date: "2025-03-13", category: "Login", description: "User admin logged in." },
  { id: 7, date: "2025-02-11", category: "Update", description: "User updated profile info." },
  { id: 8, date: "2025-02-19", category: "Logout", description: "User admin logged out." },
  { id: 9, date: "2025-03-07", category: "Delete", description: "User deleted an entry." },
  { id: 10, date: "2025-01-13", category: "Login", description: "User driver123 logged in." }
];

export default function Logs() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredLogs = dummyLogs.filter(log =>
    categoryFilter ? log.category === categoryFilter : true
  );

  const sortedLogs = [...filteredLogs].sort((a, b) =>
    sortOrder === "asc" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
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
          <li key={log.id} className="p-2 border-b">
            <span className="font-semibold">{log.date}</span> - {log.category}: {log.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
