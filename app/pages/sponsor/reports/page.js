// app/pages/sponsor/reports/page.js

"use client";
import React, { useState } from "react";

export default function SponsorReportsPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("driver_applications");


  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    setError(null);
    const sponsorId = 1;

    try {
      const endpointType = reportType === "point_changes"
        ? "point_change_audit_log"
        : "report_driver_applications";

      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/reports?type=${endpointType}&start_date=${startDate}&end_date=${endDate}&sponsor_id=${sponsorId}`
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
      <h1 className="text-2xl font-bold mb-4">
        {reportType === "driver_applications"
          ? "Driver Applications Report"
          : "Point Changes Audit Log"}
      </h1>

      {/* Filter Controls */}
      <div className="mb-4 flex flex-col md:flex-row items-start gap-4">
        <div>
          <label className="block text-sm font-medium">Select Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="driver_applications">Driver Applications</option>
            <option value="point_changes">Point Changes Audit Log</option>
          </select>
        </div>
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
                {reportType === "driver_applications" ? (
                  <>
                    <th className="p-2 border">Application ID</th>
                    <th className="p-2 border">Driver Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Submitted</th>
                    <th className="p-2 border">Processed</th>
                    <th className="p-2 border">Agreed</th>
                  </>
                ) : (
                  <>
                    <th className="p-2 border">Point Change ID</th>
                    <th className="p-2 border">Driver ID</th>
                    <th className="p-2 border">Sponsor User ID</th>
                    <th className="p-2 border">Points</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Reason</th>
                    <th className="p-2 border">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) =>
                reportType === "driver_applications" ? (
                  <tr key={row.Application_ID || `app-${index}`}>
                    <td className="p-2 border">{row.Application_ID}</td>
                    <td className="p-2 border">{row.Driver_Name}</td>
                    <td className="p-2 border">{row.Email}</td>
                    <td className="p-2 border">{row.Phone}</td>
                    <td className="p-2 border">{row.App_Status}</td>
                    <td className="p-2 border">{row.Submitted_At}</td>
                    <td className="p-2 border">{row.Processed_At || "Pending"}</td>
                    <td className="p-2 border">{row.Policies_Agreed}</td>
                  </tr>
                ) : (
                  <tr key={row.Points_Change_ID || `points-${index}`}>
                    <td className="p-2 border">{row.Points_Change_ID}</td>
                    <td className="p-2 border">{row.Driver_ID}</td>
                    <td className="p-2 border">{row.Sponsor_User_ID}</td>
                    <td className="p-2 border">{row.Num_Points}</td>
                    <td className="p-2 border">{row.Point_Change_Type}</td>
                    <td className="p-2 border">{row.Reason}</td>
                    <td className="p-2 border">{row.Change_Date}</td>
                  </tr>
                )
              )}
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