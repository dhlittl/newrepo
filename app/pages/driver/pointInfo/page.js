"use client";
import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffectiveDriverId } from "@/hooks/useEffectiveDriverId";
import { useRouter } from "next/navigation";

export default function PointInfo() {
  const router = useRouter();
  const { userId, isAssumed } = useEffectiveDriverId();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pointChanges, setPointChanges] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState("all");

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
    if (!authorized || !userId) return;

    const fetchPointChanges = async () => {
      try {
        const res = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/Driver/pointsInfo?userId=${userId}`
        );

        if (!res.ok) throw new Error("Failed to fetch point history");

        const data = await res.json();

        // Sort by Change_Date descending
        const sorted = data.sort(
          (a, b) => new Date(b.Change_Date) - new Date(a.Change_Date)
        );

        setPointChanges(sorted);
      } catch (err) {
        console.error("Error fetching point history:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPointChanges();
  }, [authorized, userId]);

  const sponsorOptions = Array.from(
    new Map(pointChanges.map((pc) => [pc.Sponsor_Org_ID, pc.Sponsor_Org_Name]))
  );

  const filteredPoints =
    selectedSponsor === "all"
      ? pointChanges
      : pointChanges.filter((pc) => pc.Sponsor_Org_ID === parseInt(selectedSponsor));

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-black">Your Point History</h2>

      {loading && <p className="text-gray-500">Loading point history...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && pointChanges.length === 0 && (
        <p className="text-gray-500">No point history available.</p>
      )}

      {!loading && !error && pointChanges.length > 0 && (
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Sponsor
            </label>
            <select
              className="border rounded px-3 py-2 text-sm w-full"
              value={selectedSponsor}
              onChange={(e) => setSelectedSponsor(e.target.value)}
            >
              <option value="all">All Sponsors</option>
              {sponsorOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border">
              <thead className="bg-gray-100 text-gray-900 font-semibold">
                <tr>
                  <th className="px-4 py-2 border">Point Change ID</th>
                  <th className="px-4 py-2 border">Sponsor Org</th>
                  <th className="px-4 py-2 border">Sponsor User ID</th>
                  <th className="px-4 py-2 border">Num Points</th>
                  <th className="px-4 py-2 border">Change Type</th>
                  <th className="px-4 py-2 border">Reason</th>
                  <th className="px-4 py-2 border">Change Date</th>
                  <th className="px-4 py-2 border">Expiration Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPoints.map((entry, idx) => (
                  <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-2 border">{entry.Points_Change_ID}</td>
                    <td className="px-4 py-2 border">{entry.Sponsor_Org_Name || "—"}</td>
                    <td className="px-4 py-2 border">{entry.Sponsor_User_ID}</td>
                    <td className="px-4 py-2 border">{Number(entry.Num_Points)}</td>
                    <td className="px-4 py-2 border">{entry.Point_Change_Type}</td>
                    <td className="px-4 py-2 border">{entry.Reason}</td>
                    <td className="px-4 py-2 border">
                      {entry.Change_Date ? new Date(entry.Change_Date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-2 border">
                      {entry.Exp_Date ? new Date(entry.Exp_Date).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
