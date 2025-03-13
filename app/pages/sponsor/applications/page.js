"use client";
import  React , { useState, useEffect } from 'react';

export default function HelpDesk() {

  const [applications, setApplications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sponsorId = 1; // Replace with dynamic value if needed

  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications?sponsor_id=${sponsorId}`);
  
        if (!response.ok) {
          throw new Error(`Failed to fetch pending applications: ${response.statusText}`);
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
          submittedAt: app.Submitted_At,
        }));
  
        setApplications(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPendingApplications();
  }, []);

  const reviewApplication = async (applicationId, status) => {
    try {
      const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
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
        throw new Error(`Failed to ${status.toLowerCase()} application: ${response.statusText}`);
      }

      console.log(`Application ${applicationId} ${status.toLowerCase()} successfully`);
      
      fetchPendingApplications();
    } catch (err) {
      console.error(`Error updating application: ${err.message}`);
      setError(err.message);
    }
  };


  return (
    <main>
      <h1>Pending Applications</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {applications && applications.length === 0 && <p>No pending applications.</p>}

      {applications && applications.length > 0 && (
        <ul>
          {applications.map((app) => (
            <li key={app.id}>
              {app.fname} {app.lname} - {app.email} - {app.phone} (Submitted: {app.submittedAt})
              {" "}
              <button onClick={() => reviewApplication(app.id, "Approved")} style={{ marginLeft: "10px", color: "green" }}>
                Approve
              </button>
              {" "}
              <button onClick={() => reviewApplication(app.id, "Denied")} style={{ marginLeft: "5px", color: "red" }}>
                Deny
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
