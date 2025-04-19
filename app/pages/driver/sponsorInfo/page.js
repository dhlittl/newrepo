// /pages/driver/sponsorInfo

"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffectiveDriverId } from "@/hooks/useEffectiveDriverId";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SponsorsPageWithApplications() {
  const router = useRouter();
  const { userId, isAssumed } = useEffectiveDriverId();

  const [authorized,    setAuthorized   ] = useState(false);
  const [loading,       setLoading      ] = useState(true);
  const [error,         setError        ] = useState(null);
  const [sponsors,      setSponsors     ] = useState([]);
  const [applications,  setApplications ] = useState([]);
  const [isPanelOpen,   setIsPanelOpen  ] = useState(true);

  /* ---------- auth ---------- */
  useEffect(() => {
    (async () => {
      try {
        const s = await fetchAuthSession();
        const g = s.tokens?.idToken?.payload["cognito:groups"] || [];
        g.includes("driver") || g.includes("sponsor") || g.includes("admin")
          ? setAuthorized(true)
          : router.replace("/unauthorized");
      } catch { router.replace("/login"); }
    })();
  }, [router]);

  /* ---------- data ---------- */
  useEffect(() => {
    if (!authorized || !userId) return;

    /* sponsors */
    (async () => {
      try {
        const r = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Info?userId=${userId}`
        );
        const j = await r.json();
        const basics = j.map(s => ({
          id: s.Sponsor_Org_ID,   name: s.Sponsor_Name,
          email: s.Email,         phone: s.Phone_Number,
          description: s.Sponsor_Description || "",
          totalPoints: s.Point_Balance || 0,
          points: []
        }));
        const detailed = await Promise.all(
          basics.map(async s => {
            try {
              const pr = await fetch(
                `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/drivers/pointsKey?sponsorOrgId=${s.id}`
              );
              return pr.ok ? { ...s, points: await pr.json() } : s;
            } catch { return s; }
          })
        );
        setSponsors(detailed);
      } catch (e) { setError(String(e)); }
      finally    { setLoading(false); }
    })();

    /* applications */
    (async () => {
      try {
        const r = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser/Info?userId=${userId}`
        );
        const j = await r.json();
        const a = (j.body ? JSON.parse(j.body) : j).filter(x => x.Application_ID);
        setApplications(a);
      } catch { /* ignore */ }
    })();
  }, [authorized, userId]);

  /* ---------- UI ---------- */
  return (
    <main className="flex h-full relative">
      {/* PANEL */}
      <aside
        className={`transition-all duration-300 ease-in-out bg-white shadow-lg border-r flex flex-col
                    ${isPanelOpen ? "w-80" : "w-12"} overflow-hidden`}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-2 p-3 border-b bg-gray-100">
          {isPanelOpen && (
            <>
              <h2 className="font-semibold text-sm text-black whitespace-nowrap">
                My&nbsp;Applications
              </h2>
              <Link href="/pages/driver/applyForm" className="ml-auto">
                <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700">
                  New Application
                </button>
              </Link>
            </>
          )}
          {/* arrow */}
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="text-blue-600 text-xs font-medium hover:underline"
          >
            {isPanelOpen ? "←" : "→"}
          </button>
        </div>

        {/* body */}
        {isPanelOpen && (
          <div className="p-4 space-y-4 overflow-y-auto">
            {applications.length === 0 ? (
              <p className="text-gray-500 text-sm">No applications.</p>
            ) : (
              applications.map(app => (
                <div key={app.Application_ID}
                     className="border rounded-lg p-3 shadow-sm bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-sm">#{app.Application_ID}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      app.App_Status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : app.App_Status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {app.App_Status}
                    </span>
                  </div>
                  <p className="text-xs"><strong>Sponsor:</strong> {app.Sponsor_Name || app.Sponsor_Org_ID}</p>
                  <p className="text-xs"><strong>Submitted:</strong> {app.Submitted_At}</p>
                  {app.Processed_At && (
                    <p className="text-xs"><strong>Processed:</strong> {app.Processed_At}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </aside>

      {/* MAIN */}
      <section className="flex-1 p-6 max-w-5xl mx-auto ml-2">
        {isAssumed && (
          <button
            className="mb-4 text-sm text-gray-700 underline"
            onClick={() => {
              sessionStorage.removeItem("assumedDriverId");
              sessionStorage.removeItem("assumedDriverName");
              router.push("/pages/sponsor/drivers");
            }}
          >
            ← Return to Sponsor View
          </button>
        )}

        {/* main header with All‑Sponsors button */}
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-black">My Sponsors</h2>

          <Link href="/pages/driver/sponsorsPage" className="ml-auto">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              All&nbsp;Sponsors
            </button>
          </Link>
        </header>

        {loading && <p className="text-gray-500">Loading sponsors…</p>}
        {error   && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && sponsors.length === 0 && (
          <p className="text-gray-500">No sponsors found.</p>
        )}

        {!loading && !error && sponsors.length > 0 && (
          <div className="space-y-6">
            {sponsors.map(s => (
              <div key={s.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                <h3 className="text-lg font-semibold text-black">{s.name}</h3>
                <p className="text-gray-700">{s.description}</p>
                <p className="text-gray-700"><strong>Contact:</strong> {s.email}</p>
                <p className="text-gray-700"><strong>Phone:</strong> {s.phone}</p>
                <p className="mt-4 text-gray-700"><strong>Total Points:</strong> {s.totalPoints} pts</p>

                <div className="mt-4">
                  <p className="text-gray-700 font-medium">Points System:</p>
                  {s.points.length === 0 ? (
                    <p className="text-gray-500">No point records available.</p>
                  ) : (
                    <div className="overflow-x-auto mt-2">
                      <table className="min-w-full text-sm text-left text-gray-700 border">
                        <thead className="bg-gray-100 text-gray-900 font-semibold">
                          <tr><th className="px-4 py-2 border">Reason</th><th className="px-4 py-2 border">Points</th></tr>
                        </thead>
                        <tbody>
                          {s.points.map((p, i) => (
                            <tr key={i} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-2 border">{p.Reason}</td>
                              <td className="px-4 py-2 border">{p.Points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
