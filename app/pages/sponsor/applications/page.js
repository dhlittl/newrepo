"use client";
import React, { useState, useEffect } from "react";

export default function ApplicationViewing() {
  const [applications, setApplications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sponsorId, setSponsorId] = useState(1);

  const fetchPendingApplications = async () => {
    try {
      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications?sponsor_id=${sponsorId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      const transformedData = data.map((app) => ({
        id: app.Application_ID,
        user_id: app.User_ID,
        fname: app.FName,
        lname: app.LName,
        email: app.Email,
        phone: app.Phone,
        submittedAt: new Date(app.Submitted_At).toLocaleDateString(),
      }));

      setApplications(transformedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApplications();
  }, [sponsorId]);

  const reviewApplication = async (applicationId, status) => {
    try {
      const response = await fetch(
        "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application_id: applicationId,
            sponsor_id: sponsorId,
            status: status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to ${status.toLowerCase()} application: ${response.statusText}`
        );
      }

      console.log(`Application ${applicationId} ${status.toLowerCase()} successfully`);

      if (status === "Approved") {
        const application = applications.find(app => app.id === applicationId);

        console.log("Calling POST to promote user:", {
          url: "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
          body: { user_id: application.user_id }
        });
        
        const lambdaResponse = await fetch(
          "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: application.user_id, // <-- Send user ID instead of email
            }),
          }
        );

        if (!lambdaResponse.ok) {
          const errorText = await lambdaResponse.text();  // Read full response body
          console.error("Failed POST response:", lambdaResponse.status, errorText);
          throw new Error(`Failed to invoke Lambda function: ${lambdaResponse.statusText}`);
        }

        console.log(`Lambda invoked for user_id ${application.user_id}`);
        fetchPendingApplications();
      }

    } catch (err) {
      console.error(`Error updating application: ${err.message}`);
      setError(err.message);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Pending Applications</h1>

      <div className="mb-4">
        <label htmlFor="sponsor-select" className="text-gray-700">Select Sponsor:</label>
        <select
          id="sponsor-select"
          className="ml-2 p-2 border rounded"
          value={sponsorId}
          onChange={(e) => setSponsorId(Number(e.target.value))}
        >
          <option value={1}>Sponsor 1</option>
          <option value={2}>Sponsor 2</option>
          <option value={3}>Sponsor 3</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {applications && applications.length === 0 && <p>No pending applications.</p>}

      {applications && applications.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Submitted</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="text-center hover:bg-gray-50">
                  <td className="px-4 py-2 border">{app.fname} {app.lname}</td>
                  <td className="px-4 py-2 border">{app.email}</td>
                  <td className="px-4 py-2 border">{app.phone}</td>
                  <td className="px-4 py-2 border">{app.submittedAt}</td>
                  <td className="px-4 py-2 border flex justify-center gap-2">
                    <button
                      onClick={() => reviewApplication(app.id, "Approved")}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reviewApplication(app.id, "Denied")}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Deny
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
