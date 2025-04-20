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
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
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
      case "admin":
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/Info?userId=${user.User_ID}`;
        break;
      case "driver":
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Info?userId=${user.User_ID}`;
        break;
      case "sponsor":
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

  const reviewApplication = async (app, status) => {
    const {
      Application_ID: applicationId,
      Sponsor_Org_ID: sponsor_id,
      Email: email,
      FName: fname,
      Username: username,
    } = app;

    const payload = {
      application_id: applicationId,
      sponsor_id,
      status,
    };

    try {
      const response = await fetch(
        "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/applications",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || `Failed to ${status.toLowerCase()} application`);
      }

      if (status === "Approved") {
        const groupResponse = await fetch(
          "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/assignDriverGroup",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          }
        );

        if (!groupResponse.ok) {
          const errorText = await groupResponse.text();
          console.error("Failed to add to Driver group:", groupResponse.status, errorText);
          throw new Error("Could not add user to Driver group");
        }
      }

      const subject = `Your application has been ${status.toLowerCase()}`;
      const body = `
        <html><body>
          <p>Hi ${fname},</p>
          <p>Your application to Sponsor <strong>#${sponsor_id}</strong> was <strong>${status}</strong>.</p>
          ${
            status === "Approved"
              ? "<p>Congratulations! You can now access driver features.</p>"
              : "<p>We're sorry, but your application was not approved at this time.</p>"
          }
          <p>Thanks,<br/>The Rewards Team</p>
        </body></html>
      `;

      await sendAlertEmail(email, subject, body);

      setSuccessMessage(`Application ${status.toLowerCase()} successfully.`);
      setTimeout(() => {
        setSuccessMessage(null);
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error(`Error updating application: ${err.message}`);
      setError(err.message);
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
      const updatedUsers = users.map((u) =>
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

    const dateFields = ["Start_Date", "End_Date"];
    if (dateFields.includes(sortConfig.key)) {
      aKey = aKey ? new Date(aKey) : new Date(0);
      bKey = bKey ? new Date(bKey) : new Date(0);
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

      {successMessage && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-400">
          {successMessage}
        </div>
      )}

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
            <option value="defaultUser">Default</option>
            <option value="driver">Driver</option>
            <option value="sponsor">Sponsor</option>
            <option value="admin">Admin</option>
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
        onApprove={(user, app) => reviewApplication(app, "Approved")}
        onDeny={(user, app) => reviewApplication(app, "Denied")}
        onEdit={(user) => {
          setFormData({
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
