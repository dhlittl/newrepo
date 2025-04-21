// pages/sponsor/applications

"use client";
import React, { useState, useEffect } from "react";
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import { useEffectiveSponsorId } from '@/hooks/useEffectiveSponsorId';
import { useRouter } from 'next/navigation';

export default function ApplicationViewing() {
  const [applications, setApplications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { userId, isAssumed } = useEffectiveDriverId();
  const { sponsorOrgId, sponsorUserInfo, loading: sponsorLoading } = useEffectiveSponsorId();
  const [authorized, setAuthorized] = useState(false);

  const fetchPendingApplications = async () => {
    if (!sponsorOrgId) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications?sponsor_id=${sponsorOrgId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      const transformedData = data.map((app) => ({
        id: app.Application_ID,
        user_id: app.User_ID,
        username: app.Username,
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
    if (!authorized || !userId || !sponsorOrgId || sponsorLoading) return;
    fetchPendingApplications();
  }, [authorized, userId, sponsorOrgId, sponsorLoading]);

  const sendAlertEmail = async (recipientEmail, subject, htmlBody) => {
    await fetch(
      "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail,
          emailSubject: subject,
          emailBody: htmlBody,
        }),
      }
    );
  };

  const reviewApplication = async (applicationId, status) => {
    try {
      const response = await fetch(
        "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application_id: applicationId,
            sponsor_id: sponsorOrgId,
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

      if (status == "Approved") {
        const application = applications.find(app => app.id === applicationId);

        console.log("Calling assign-driver-group endpoint:", {
          url: "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/assignDriverGroup",
          body: { username: application.username }
        });

        const groupResponse = await fetch(
          "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/assignDriverGroup",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: application.username })
          }
        );

        if (!groupResponse.ok) {
          const errorText = await groupResponse.text();
          console.error("Failed to add to Driver group:", groupResponse.status, errorText);
          throw new Error("Could not add user to Driver group");
        }
        console.log(`Successfully added ${application.username} to Driver group`);
      }
      const app = applications.find((a) => a.id === applicationId);
      if (!app) throw new Error("Application not found");
  
      const subject = `Your application has been ${status.toLowerCase()}`;
      const body = `
        <html><body>
          <p>Hi ${app.fname},</p>
          <p>Your application to ${sponsorUserInfo?.Sponsor_Name || `Sponsor #${sponsorOrgId}`} was <strong>${status}</strong>.</p>
          ${
            status === "Approved"
              ? "<p>Congratulations! You can now access driver features.</p>"
              : "<p>We're sorry, but your application was not approved at this time.</p>"
          }
          <p>Thanks,<br/>The Rewards Team</p>
        </body></html>
      `;
  
      await sendAlertEmail(app.email, subject, body);
      fetchPendingApplications();
  
    } catch (err) {
      console.error(`Error updating application: ${err.message}`);
      setError(err.message);
    }
  };
  

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Pending Applications</h1>

      {sponsorUserInfo && (
        <div className="mb-4 text-lg text-gray-700">
          Organization: <span className="font-semibold">{sponsorUserInfo.Sponsor_Name || `Sponsor #${sponsorOrgId}`}</span>
        </div>
      )}

      {(loading || sponsorLoading) && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!sponsorOrgId && !sponsorLoading && (
        <p className="text-yellow-600 p-3 bg-yellow-50 rounded">
          No sponsor organization assigned to your account. Please contact an administrator.
        </p>
      )}
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