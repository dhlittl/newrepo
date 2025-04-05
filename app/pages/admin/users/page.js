"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ShowUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'User_ID', direction: 'asc' });
  const [filterUserType, setFilterUserType] = useState('all');
  const [expandedRows, setExpandedRows] = useState([]); // Array of expanded user IDs
  const [expandedDetails, setExpandedDetails] = useState({}); // Mapping of userId to additional details

  // Fetch users when the component mounts
  useEffect(() => {
    fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/allUsers')
      .then((res) => res.json())
      .then((data) => {
        const usersArray = data.body ? JSON.parse(data.body) : data;
        setUsers(usersArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  // Filtering by user type if selected
  let filteredUsers = [...users];
  if (filterUserType !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.User_Type === filterUserType);
  }

  // Sorting the filtered users
  const sortedUsers = filteredUsers.sort((a, b) => {
    let aKey = a[sortConfig.key];
    let bKey = b[sortConfig.key];

    if (sortConfig.key === 'Start_Date') {
      aKey = new Date(aKey);
      bKey = new Date(bKey);
    }
    if (aKey < bKey) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aKey > bKey) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Toggle sort configuration when a header is clicked
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper to display sort indicator (active: ▲/▼, inactive: ⇅)
  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '⇅';
  };

  // Fetch additional details for a user based on role
  const fetchUserDetails = async (user) => {
    let endpoint = '';
    switch (user.User_Type) {
      case 'Admin':
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/getAdminDetails?userId=${user.User_ID}`;
        break;
      case 'Driver':
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/getDriverDetails?userId=${user.User_ID}`;
        break;
      case 'Sponsor':
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Sponsor/getSponsorDetails?userId=${user.User_ID}`;
        break;
      default:
        // For default users, we assume application data
        endpoint = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Default/getApplicationDetails?userId=${user.User_ID}`;
        break;
    }
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const details = data.body ? JSON.parse(data.body) : data;
      return details;
    } catch (error) {
      console.error('Error fetching additional details:', error);
      return null;
    }
  };

  // Toggle expansion of a row. If not expanded, fetch the details.
  const toggleRowExpansion = async (user) => {
    if (expandedRows.includes(user.User_ID)) {
      setExpandedRows(expandedRows.filter(id => id !== user.User_ID));
    } else {
      if (!expandedDetails[user.User_ID]) {
        const details = await fetchUserDetails(user);
        setExpandedDetails(prev => ({ ...prev, [user.User_ID]: details }));
      }
      setExpandedRows([...expandedRows, user.User_ID]);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">List of Users</h1>
       {/* Add User Button & Filter */}
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
              <th onClick={() => requestSort('User_ID')} className="border p-2 cursor-pointer" title="Click to sort">
                User_ID {renderSortIndicator('User_ID')}
              </th>
              <th onClick={() => requestSort('FName')} className="border p-2 cursor-pointer" title="Click to sort">
                FName {renderSortIndicator('FName')}
              </th>
              <th onClick={() => requestSort('LName')} className="border p-2 cursor-pointer" title="Click to sort">
                LName {renderSortIndicator('LName')}
              </th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone_Number</th>
              <th onClick={() => requestSort('Start_Date')} className="border p-2 cursor-pointer" title="Click to sort">
                Start_Date {renderSortIndicator('Start_Date')}
              </th>
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
                  <td className="border p-2">{user.Email}</td>
                  <td className="border p-2">{user.Phone_Number}</td>
                  <td className="border p-2">{user.Start_Date}</td>
                  <td className="border p-2">{user.End_Date}</td>
                  <td className="border p-2">{user.User_Type}</td>
                </tr>
                {expandedRows.includes(user.User_ID) && (
                  <tr className="bg-gray-50">
                    <td className="border p-2" colSpan={8}>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                        {/* Always display these extra fields in the expanded view */}
                        <p><strong>Username:</strong> {user.Username || 'N/A'}</p>
                        <p><strong>Cognito Sub:</strong> {user.Cognito_Sub || 'N/A'}</p>
                        {expandedDetails[user.User_ID] ? (
                          <div className="mt-2">
                            {user.User_Type === 'Admin' && (
                              <p><strong>Admin ID:</strong> {expandedDetails[user.User_ID].Admin_ID || 'N/A'}</p>
                            )}
                            {user.User_Type === 'Driver' && (
                              <>
                                <p><strong>Point Balance:</strong> {expandedDetails[user.User_ID].Point_Balance}</p>
                                <p><strong>Number of Purchases:</strong> {expandedDetails[user.User_ID].Num_Purchases}</p>
                                <p><strong>Point Goal:</strong> {expandedDetails[user.User_ID].Point_Goal}</p>
                              </>
                            )}
                            {user.User_Type === 'Sponsor' && (
                              <>
                                <p><strong>Sponsor Org ID:</strong> {expandedDetails[user.User_ID].Sponsor_Org_ID}</p>
                                <p><strong>Number of Point Changes:</strong> {expandedDetails[user.User_ID].Num_Point_Changes}</p>
                              </>
                            )}
                            {user.User_Type === 'Default' && (
                              <>
                                <h4 className="mt-2 font-semibold">Application Status</h4>
                                {expandedDetails[user.User_ID].length ? (
                                  expandedDetails[user.User_ID].map((app, idx) => (
                                    <div key={idx} className="border p-2 my-1">
                                      <p><strong>Application ID:</strong> {app.Application_ID}</p>
                                      <p><strong>Status:</strong> {app.App_Status}</p>
                                      <p><strong>Submitted At:</strong> {app.Submitted_At}</p>
                                    </div>
                                  ))
                                ) : (
                                  <p>No applications found.</p>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <p>Loading additional details...</p>
                        )}
                        <div className="mt-4">
                          <Link href={`/pages/admin/UpdateUserInfo?userId=${user.User_ID}`}>
                            <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                              Update User Info
                            </button>
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
