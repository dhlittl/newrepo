// app/pages/sponsor/reports/page.js

"use client";
import React, { useState } from "react";

export default function SponsorReportsPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/reports?type=report_driver_applications&start_date=${startDate}&end_date=${endDate}`
      );

      const result = await response.json();

      if (response.ok) {
        setReportData(result);
      } else {
        setError(result.error || "Failed to fetch report");
      }
    } catch (err) {
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Applications Report</h1>

      {/* Date Selection */}
      <div className="mb-4 flex flex-col md:flex-row items-start gap-4">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <button
          onClick={fetchReport}
          className="mt-6 md:mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Get Report
        </button>
      </div>

      {/* Loading/Error States */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {/* Report Table */}
      {!loading && !error && reportData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Application ID</th>
                <th className="p-2 border">Driver Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Submitted</th>
                <th className="p-2 border">Processed</th>
                <th className="p-2 border">Agreed</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((app) => (
                <tr key={app.Application_ID}>
                  <td className="p-2 border">{app.Application_ID}</td>
                  <td className="p-2 border">{app.Driver_Name}</td>
                  <td className="p-2 border">{app.Email}</td>
                  <td className="p-2 border">{app.Phone}</td>
                  <td className="p-2 border">{app.App_Status}</td>
                  <td className="p-2 border">{app.Submitted_At}</td>
                  <td className="p-2 border">{app.Processed_At || "Pending"}</td>
                  <td className="p-2 border">{app.Policies_Agreed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && reportData.length === 0 && (
        <p className="text-gray-600">No results for selected date range.</p>
      )}
    </main>
  );
}