"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffectiveDriverId } from "@/hooks/useEffectiveDriverId";

export default function MyApplicationsPage() {
  const router = useRouter();
  const { userId } = useEffectiveDriverId();
  const [authorized, setAuthorized] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkGroup() {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.idToken?.payload["cognito:groups"] || [];

        if (groups.includes("defaultUser")) {
          setAuthorized(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch (err) {
        console.error("Auth error:", err);
        router.replace("/login");
      }
    }

    checkGroup();
  }, [router]);

  useEffect(() => {
    async function fetchApplications() {
      if (!authorized || !userId) return;

      try {
        const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser/Info?userId=${userId}`);
        const data = await res.json();
        const parsed = data.body ? JSON.parse(data.body) : data;
        const apps = Array.isArray(parsed) ? parsed.filter(a => a.Application_ID) : [];

        setApplications(apps);
      } catch (err) {
        console.error("Failed to load application data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [authorized, userId]);

  if (loading) return <div className="p-4">Loading your applications...</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <Link href="/pages/defaultUser/applyForm">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            New Application
          </button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <p className="text-gray-600 italic">You haven't submitted any applications yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.Application_ID} className="border rounded-lg p-4 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Application #{app.Application_ID}</h4>
                <span className={`px-2 py-1 text-sm rounded-full ${
                  app.App_Status === "Pending" ? "bg-amber-100 text-amber-800" :
                  app.App_Status === "Approved" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {app.App_Status}
                </span>
              </div>
              <p><span className="font-medium">Sponsor:</span> {app.Sponsor_Name || app.Sponsor_Org_ID}</p>
              <p><span className="font-medium">Submitted:</span> {app.Submitted_At}</p>
              {app.Processed_At && <p><span className="font-medium">Processed:</span> {app.Processed_At}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
