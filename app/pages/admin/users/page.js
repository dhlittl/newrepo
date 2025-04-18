"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ShowUsers() {
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

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) return sortConfig.direction === "asc" ? "▲" : "▼";
    return "⇅";
  };

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
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser/Info?userId=${user.User_ID}`;
        break;
    }

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const details = data.body ? JSON.parse(data.body) : data;
      return Array.isArray(details) ? details : [details];
    } catch (err) {
      console.error("Error fetching additional details:", err);
      return [];
    }
  };

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

  const filteredUsers = filterUserType === "all"
    ? users
    : users.filter(user => user.User_Type === filterUserType);

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

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">List of Users</h1>

      <div className="flex items-center mb-4 space-x-4">
        <Link href="/pages/admin/CreateUserAccount">
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Add New User
          </button>
        </Link>
        <div>
          <label htmlFor="filter" className="mr-2">Filter by User Type:</label>
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

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th onClick={() => requestSort('User_ID')} className="border p-2 cursor-pointer">User_ID {renderSortIndicator('User_ID')}</th>
              <th onClick={() => requestSort('FName')} className="border p-2 cursor-pointer">FName {renderSortIndicator('FName')}</th>
              <th onClick={() => requestSort('LName')} className="border p-2 cursor-pointer">LName {renderSortIndicator('LName')}</th>
              <th className="border p-2">Start_Date</th>
              <th className="border p-2">End_Date</th>
              <th className="border p-2">User_Type</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <React.Fragment key={user.User_ID}>
                <tr onClick={() => toggleRowExpansion(user)} className="cursor-pointer hover:bg-gray-100">
                  <td className="border p-2">{user.User_ID}</td>
                  <td className="border p-2">{user.FName}</td>
                  <td className="border p-2">{user.LName}</td>
                  <td className="border p-2">{user.Start_Date}</td>
                  <td className="border p-2">{user.End_Date}</td>
                  <td className="border p-2">{user.User_Type}</td>
                </tr>

                {expandedRows.includes(user.User_ID) && (
                  <tr className="bg-white">
                    <td className="border p-4" colSpan={6}>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2 space-y-2">
                          <h3 className="text-lg font-semibold mb-1 border-b pb-1">General Info</h3>
                          <p><span className="font-medium">Username:</span> {user.Username || 'N/A'}</p>
                          <p><span className="font-medium">Email:</span> {user.Email || 'N/A'}</p>
                          <p><span className="font-medium">Phone:</span> {user.Phone_Number || 'N/A'}</p>
                        </div>

                        <div className="md:w-1/2 space-y-2">
                          <h3 className="text-lg font-semibold mb-1 border-b pb-1">{user.User_Type} Info</h3>

                          {/* DEFAULT USERS */}
                          {user.User_Type === "Default" && (() => {
                            const apps = (expandedDetails[user.User_ID] || []).filter(a => a.Application_ID);
                            if (apps.length === 0) return <p className="italic text-gray-500">No applications</p>;
                            return apps.map((app, idx) => (
                              <div key={idx} className="border rounded-lg p-4 mb-4 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-semibold">Application #{app.Application_ID}</h4>
                                  <span className={
                                    app.App_Status === "Pending"
                                      ? "bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm"
                                      : app.App_Status === "Approved"
                                      ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                                      : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm"
                                  }>
                                    {app.App_Status}
                                  </span>
                                </div>
                                <p><span className="font-medium">Sponsor:</span> {app.Sponsor_Name || "N/A"}</p>
                                <p><span className="font-medium">Submitted:</span> {app.Submitted_At}</p>
                                {app.Processed_At && <p><span className="font-medium">Processed:</span> {app.Processed_At}</p>}
                              </div>
                            ));
                          })()}

                          {/* DRIVER USERS */}
                          {user.User_Type === "Driver" &&
                            (expandedDetails[user.User_ID] || []).map((entry, idx) => (
                              <div key={idx} className="border rounded-lg p-4 mb-4 shadow-sm">
                                <p><span className="font-medium">Sponsor:</span> {entry.Sponsor_Name || entry.Sponsor_Org_Name || entry.Sponsor_Org_ID}</p>
                                <p><span className="font-medium">Points:</span> {entry.Point_Balance}</p>
                                <p><span className="font-medium">Purchases:</span> {entry.Num_Purchases}</p>
                              </div>
                          ))}

                          {/* SPONSOR USERS */}
                          {user.User_Type === "Sponsor" &&
                            (expandedDetails[user.User_ID] || []).map((entry, idx) => (
                              <div key={idx} className="border rounded-lg p-4 mb-4 shadow-sm">
                                <p><span className="font-medium">Organization:</span> {entry.Sponsor_Name || entry.Sponsor_Org_Name || entry.Sponsor_Org_ID}</p>
                                <p><span className="font-medium">Point Changes:</span> {entry.Num_Point_Changes}</p>
                              </div>
                          ))}

                          {/* ADMIN USERS */}
                          {user.User_Type === "Admin" &&
                            (expandedDetails[user.User_ID] || []).map((entry, idx) => (
                              <div key={idx} className="border rounded-lg p-4 mb-4 shadow-sm">
                                <p><span className="font-medium">Admin ID:</span> {entry.Admin_ID}</p>
                              </div>
                          ))}
                        </div>
                      </div>

                      {/* Update Button */}
                      <div className="mt-4">
                        <button
                          className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition"
                          onClick={() => {
                            setFormData({
                              Username: user.Username,
                              FName: user.FName,
                              LName: user.LName,
                              Email: user.Email,
                              Phone_Number: user.Phone_Number
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

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Edit User Info</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/allUsers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ User_ID: editingUser.User_ID, ...formData }),
              });
              if (res.ok) {
                alert("User updated successfully!");
                setIsModalOpen(false);
                const updatedUsers = users.map(u =>
                  u.User_ID === editingUser.User_ID ? { ...u, ...formData } : u
                );
                setUsers(updatedUsers);
              } else {
                alert("Failed to update user.");
              }
            }}>
              {Object.entries(formData).map(([key, val]) => (
                <div key={key} className="mb-3">
                  <label className="block mb-1 font-medium capitalize">{key.replace("_", " ")}</label>
                  <input
                    type="text"
                    name={key}
                    value={val}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
