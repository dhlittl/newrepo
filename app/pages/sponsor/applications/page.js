"use client";
import React, { useState, useEffect } from "react";

export default function ApplicationViewing() {
  const [applications, setApplications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sponsorId = 1; // Replace with dynamic value if needed

  const fetchPendingApplications = async () => {
    try {
      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications?sponsor_id=${sponsorId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch pending applications: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Transform data to match the expected format
      const transformedData = data.map((app) => ({
        id: app.Application_ID,
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
  }, []);

  const reviewApplication = async (applicationId, status) => {
    try {
      // Step 1: Update the application status via your existing API
      const response = await fetch(
        "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
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
  
      // Step 2: Call the Lambda function if the application is approved
      if (status === "Approved") {
        const application = applications.find(app => app.id === applicationId);
  
        const lambdaResponse = await fetch(
          "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: application.email, // Pass the email of the approved application
            }),
          }
        );
  
        if (!lambdaResponse.ok) {
          throw new Error(`Failed to invoke Lambda function: ${lambdaResponse.statusText}`);
        }
  
        console.log(`Lambda invoked for ${application.email}`);
  
        // Step 3: Refresh the applications list
        fetchPendingApplications();
      }
  
    } catch (err) {
      console.error(`Error updating application: ${err.message}`);
      setError(err.message);
    }
  };  

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Pending Applications
      </h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {applications && applications.length === 0 && (
        <p className="text-gray-500">No pending applications.</p>
      )}

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
                  <td className="px-4 py-2 border">
                    {app.fname} {app.lname}
                  </td>
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
