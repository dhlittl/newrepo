"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ShowUsers() {
  /* ────────────────────────────  STATE  ──────────────────────────── */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "User_ID", direction: "asc" });
  const [filterUserType, setFilterUserType] = useState("all");
  const [expandedRows, setExpandedRows] = useState([]);
  const [expandedDetails, setExpandedDetails] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    Username: "",
    FName: "",
    LName: "",
    Email: "",
    Phone_Number: "",
  });

  /* ────────────────────────────  FETCH ALL USERS  ──────────────────────────── */
  useEffect(() => {
    fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/allUsers")
      .then((res) => res.json())
      .then((data) => {
        const usersArray = data.body ? JSON.parse(data.body) : data;
        setUsers(usersArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  /* ────────────────────────────  SORTING HELPERS  ──────────────────────────── */
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) return sortConfig.direction === "asc" ? "▲" : "▼";
    return "⇅";
  };

  /* ────────────────────────────  FETCH DETAILS FOR ONE USER  ──────────────────────────── */
  const fetchUserDetails = async (user) => {
    let endpoint = "";
    switch (user.User_Type) {
      case "Admin":
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/Info?userId=${user.User_ID}`;
        break;
      case "Driver":
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Info?userId=${user.User_ID}`;
        break;
      case "Sponsor":
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers/Info?userId=${user.User_ID}`;
        break;
      default:
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Default/getApplicationDetails?userId=${user.User_ID}`;
        break;
    }

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const details = data.body ? JSON.parse(data.body) : data;
      return Array.isArray(details) ? details : [details]; // always return an array
    } catch (err) {
      console.error("Error fetching additional details:", err);
      return [];
    }
  };

  /* ────────────────────────────  EXPAND / COLLAPSE ROW  ──────────────────────────── */
  const toggleRowExpansion = async (user) => {
    if (expandedRows.includes(user.User_ID)) {
      setExpandedRows(expandedRows.filter((id) => id !== user.User_ID));
    } else {
      if (!expandedDetails[user.User_ID]) {
        const details = await fetchUserDetails(user);
        setExpandedDetails((prev) => ({ ...prev, [user.User_ID]: details }));
      }
      setExpandedRows([...expandedRows, user.User_ID]);
    }
  };

  /* ────────────────────────────  FILTER + SORT  ──────────────────────────── */
  const filteredUsers =
    filterUserType === "all" ? users : users.filter((user) => user.User_Type === filterUserType);

  const sortedUsers = filteredUsers.sort((a, b) => {
    let aKey = a[sortConfig.key];
    let bKey = b[sortConfig.key];
    if (sortConfig.key === "Start_Date") {
      aKey = new Date(aKey);
      bKey = new Date(bKey);
    }
    if (aKey < bKey) return sortConfig.direction === "asc" ? -1 : 1;
    if (aKey > bKey) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  /* ────────────────────────────  RENDER  ──────────────────────────── */
  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <main className="p-4">
      {/* ───── Header + Controls ───── */}
      <h1 className="text-2xl font-bold mb-4">List of Users</h1>
      <div className="flex items-center mb-4 space-x-4">
        <Link href="/pages/admin/CreateUserAccount">
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Add New User
          </button>
        </Link>
        <div>
          <label htmlFor="filter" className="mr-2">
            Filter by User Type:
          </label>
          <select
            id="filter"
            value={filterUserType}
            onChange={(e) => setFilterUserType(e.target.value)}
            className="border rounded p-1"
          >
            <option value="all">All</option>
            <option value="Default">Default</option>
            <option value="Driver">Driver</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>

      {/* ───── Table ───── */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th onClick={() => requestSort("User_ID")} className="border p-2 cursor-pointer">
                User_ID {renderSortIndicator("User_ID")}
              </th>
              <th onClick={() => requestSort("FName")} className="border p-2 cursor-pointer">
                FName {renderSortIndicator("FName")}
              </th>
              <th onClick={() => requestSort("LName")} className="border p-2 cursor-pointer">
                LName {renderSortIndicator("LName")}
              </th>
              <th className="border p-2">Start_Date</th>
              <th className="border p-2">End_Date</th>
              <th className="border p-2">User_Type</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <React.Fragment key={user.User_ID}>
                {/* ───── Parent Row ───── */}
                <tr onClick={() => toggleRowExpansion(user)} className="cursor-pointer hover:bg-gray-100">
                  <td className="border p-2">{user.User_ID}</td>
                  <td className="border p-2">{user.FName}</td>
                  <td className="border p-2">{user.LName}</td>
                  <td className="border p-2">{user.Start_Date}</td>
                  <td className="border p-2">{user.End_Date}</td>
                  <td className="border p-2">{user.User_Type}</td>
                </tr>

                {/* ───── Expanded Content ───── */}
                {expandedRows.includes(user.User_ID) && (
                  <tr className="bg-white">
                    <td className="border p-4" colSpan={6}>
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* General Info */}
                        <div className="md:w-1/2 space-y-2">
                          <h3 className="text-lg font-semibold mb-1 border-b pb-1">General Info</h3>
                          <p>
                            <span className="font-medium">Username:</span> {user.Username || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span> {user.Email || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Phone:</span> {user.Phone_Number || "N/A"}
                          </p>
                        </div>

                        {/* Type‑specific Info */}
                        <div className="md:w-1/2 space-y-2">
                          <h3 className="text-lg font-semibold mb-1 border-b pb-1">{user.User_Type} Info</h3>

                          {/* Driver */}
                          {user.User_Type === "Driver" &&
                            Array.isArray(expandedDetails[user.User_ID]) &&
                            expandedDetails[user.User_ID].map((entry, idx) => (
                              <div key={idx} className="border-t pt-2 mt-2">
                                <p>
                                  <span className="font-medium">Sponsor Org&nbsp;ID:</span>{" "}
                                  {entry.Sponsor_Org_ID} —{" "}
                                  <span className="font-medium">Points:</span> {entry.Point_Balance}
                                </p>
                                <p>
                                  <span className="font-medium">Number&nbsp;of&nbsp;Purchases:</span>{" "}
                                  {entry.Num_Purchases}
                                </p>
                              </div>
                            ))}

                          {/* Sponsor */}
                          {user.User_Type === "Sponsor" && (
                            <>
                              <p>
                                <span className="font-medium">Sponsor Org ID:</span>{" "}
                                {expandedDetails[user.User_ID]?.[0]?.Sponsor_Org_ID ?? "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Num Point Changes:</span>{" "}
                                {expandedDetails[user.User_ID]?.[0]?.Num_Point_Changes ?? "N/A"}
                              </p>
                            </>
                          )}

                          {/* Admin */}
                          {user.User_Type === "Admin" && (
                            <p>
                              <span className="font-medium">Admin&nbsp;ID:</span>{" "}
                              {expandedDetails[user.User_ID]?.[0]?.Admin_ID ?? "N/A"}
                            </p>
                          )}

                          {/* Default – show only pending applications */}
                          {user.User_Type === "Default" && (
                            <>
                              {Array.isArray(expandedDetails[user.User_ID]) &&
                              expandedDetails[user.User_ID].some((app) => app.App_Status === "Pending") ? (
                                expandedDetails[user.User_ID]
                                  .filter((app) => app.App_Status === "Pending")
                                  .map((app, idx) => (
                                    <div key={idx} className="border-t pt-2 mt-2">
                                      <p>
                                        <span className="font-medium">Application&nbsp;ID:</span>{" "}
                                        {app.Application_ID}
                                      </p>
                                      <p>
                                        <span className="font-medium">Sponsor Org&nbsp;ID:</span>{" "}
                                        {app.Sponsor_Org_ID ?? "N/A"}
                                      </p>
                                      <p>
                                        <span className="font-medium">Status:</span>{" "}
                                        <span className="text-amber-700 font-semibold">{app.App_Status}</span>
                                      </p>
                                      <p>
                                        <span className="font-medium">Submitted:</span> {app.Submitted_At}
                                      </p>
                                    </div>
                                  ))
                              ) : (
                                <p className="italic">No pending applications</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Update‑user button */}
                      <div className="mt-4">
                        <button
                          className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition"
                          onClick={() => {
                            setFormData({
                              Username: user.Username,
                              FName: user.FName,
                              LName: user.LName,
                              Email: user.Email,
                              Phone_Number: user.Phone_Number,
                            });
                            setEditingUser(user);
                            setIsModalOpen(true);
                          }}
                        >
                          Update User Info
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ───── Modal (Edit User) ───── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Edit User Info</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch(
                  "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/allUsers",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ User_ID: editingUser.User_ID, ...formData }),
                  }
                );
                if (res.ok) {
                  alert("User updated successfully!");
                  setIsModalOpen(false);
                  const updatedUsers = users.map((u) =>
                    u.User_ID === editingUser.User_ID ? { ...u, ...formData } : u
                  );
                  setUsers(updatedUsers);
                } else {
                  alert("Failed to update user.");
                }
              }}
            >
              {Object.entries(formData).map(([key, val]) => (
                <div key={key} className="mb-3">
                  <label className="block mb-1 font-medium capitalize">
                    {key.replace("_", " ")}
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={val}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              ))}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
