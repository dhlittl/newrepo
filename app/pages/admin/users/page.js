"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ShowUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'User_ID', direction: 'asc' });
  const [filterUserType, setFilterUserType] = useState('all');

  // Fetch users when the component mounts
  useEffect(() => {
    fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/allUsers')
      .then((res) => res.json())
      .then((data) => {
        // If the response has a "body" property, parse it to get the array
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

  // Apply filtering if a specific user type is selected
  let filteredUsers = [...users];
  if (filterUserType !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.User_Type === filterUserType);
  }

  // Sort users based on sortConfig key and direction
  const sortedUsers = filteredUsers.sort((a, b) => {
    let aKey = a[sortConfig.key];
    let bKey = b[sortConfig.key];

    // Convert dates for sorting
    if (sortConfig.key === 'Start_Date') {
      aKey = new Date(aKey);
      bKey = new Date(bKey);
    }

    if (aKey < bKey) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aKey > bKey) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Toggle sort configuration when a sortable header is clicked
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper function to render sort indicator for sortable headers
  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '⇅';
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">List of Users</h1>
      <div className="flex items-center mb-4">
        <Link href="/pages/admin/CreateUserAccount">
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition mr-4">
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
              <th
                onClick={() => requestSort('User_ID')}
                className="border p-2 cursor-pointer"
                title="Click to sort"
              >
                User_ID {renderSortIndicator('User_ID')}
              </th>
              <th
                onClick={() => requestSort('FName')}
                className="border p-2 cursor-pointer"
                title="Click to sort"
              >
                FName {renderSortIndicator('FName')}
              </th>
              <th
                onClick={() => requestSort('LName')}
                className="border p-2 cursor-pointer"
                title="Click to sort"
              >
                LName {renderSortIndicator('LName')}
              </th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone_Number</th>
              <th
                onClick={() => requestSort('Start_Date')}
                className="border p-2 cursor-pointer"
                title="Click to sort"
              >
                Start_Date {renderSortIndicator('Start_Date')}
              </th>
              <th className="border p-2">End_Date</th>
              <th className="border p-2">Cognito_Sub</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">User_Type</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.User_ID}>
                <td className="border p-2">{user.User_ID}</td>
                <td className="border p-2">{user.FName}</td>
                <td className="border p-2">{user.LName}</td>
                <td className="border p-2">{user.Email}</td>
                <td className="border p-2">{user.Phone_Number}</td>
                <td className="border p-2">{user.Start_Date}</td>
                <td className="border p-2">{user.End_Date}</td>
                <td className="border p-2">{user.Cognito_Sub}</td>
                <td className="border p-2">{user.Username}</td>
                <td className="border p-2">{user.User_Type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
