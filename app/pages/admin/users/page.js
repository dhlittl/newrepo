// Admin Manage Users Page

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import UserTable from "@/components/UserTable";
import EditUserModal from "@/components/EditUserModal";


export default function ShowUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
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
      console.error("Error fetching details:", err);
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

  const sendAlertEmail = async (recipientEmail, subject, htmlBody) => {
    await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientEmail,
        emailSubject: subject,
        emailBody: htmlBody,
      }),
    });
  };

  const reviewApplication = async (user, application, status) => {
    const sponsorId = application.Sponsor_Org_ID || application.Sponsor_ID || 0;
    const applicationId = application.Application_ID;

    try {
      const putRes = await fetch(
        "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application_id: applicationId,
            sponsor_id: sponsorId,
            status,
          }),
        }
      );
      if (!putRes.ok) throw new Error(`PUT failed: ${putRes.statusText}`);

      if (status === "Approved") {
        const postRes = await fetch(
          "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: application.User_ID }),
          }
        );
        if (!postRes.ok) throw new Error(`POST failed: ${postRes.statusText}`);
      }

      const subject = `Your application has been ${status.toLowerCase()}`;
      const body = `
        <html><body>
          <p>Hi ${user.FName},</p>
          <p>Your application to Sponsor <strong>#${sponsorId}</strong> was <strong>${status}</strong>.</p>
          ${
            status === "Approved"
              ? "<p>Congratulations! You can now access driver features.</p>"
              : "<p>We're sorry, but your application was not approved at this time.</p>"
          }
          <p>Thanks,<br/>The Rewards Team</p>
        </body></html>
      `;

      await sendAlertEmail(user.Email, subject, body);

      const refreshed = await fetchUserDetails(user);
      setExpandedDetails((prev) => ({ ...prev, [user.User_ID]: refreshed }));
    } catch (err) {
      console.error("Review application error:", err);
      alert("Error: " + err.message);
    }
  };

  const handleEditSave = async (e) => {
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
  if (error) return <p className="p-4 text-red-600">{error}</p>;

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

      <UserTable
        users={sortedUsers}
        sortConfig={sortConfig}
        requestSort={requestSort}
        renderSortIndicator={renderSortIndicator}
        expandedRows={expandedRows}
        toggleRowExpansion={toggleRowExpansion}
        expandedDetails={expandedDetails}
        onApprove={(user, app) => reviewApplication(user, app, "Approved")}
        onDeny={(user, app) => reviewApplication(user, app, "Denied")}
        onEdit={(user) => {
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
      />

      <EditUserModal
        isOpen={isModalOpen}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsModalOpen(false)}
        onSave={handleEditSave}
      />
    </main>
  );
}
