// Driver Profile

"use client";
import { useEffect, useState } from "react";

export default function DriverProfilePage() {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        const response = await fetch(
          "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/profile"
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch driver profile: ${response.statusText}`);
        }
        const data = await response.json();

        console.log("API Response:", data);

        // If the data is a single object, no need to map
        const transformedData = {
          id: data.User_ID,
          fname: data.FName,
          lname: data.LName,
          email: data.Email,
          phone: data.Phone_Number,
          startDate: data.Start_Date,
        };

        setDriver(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverProfile();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-black">Your Profile</h1>

      {loading && <p className="text-gray-500">Loading profile...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && !driver && (
        <p className="text-gray-500">No driver profile found.</p>
      )}

      {!loading && !error && driver && (
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold text-black">Personal Information</h2>
            <p className="text-gray-700"><strong>User ID:</strong> {driver.id}</p>
            <p className="text-gray-700"><strong>Name:</strong> {driver.fname} {driver.lname}</p>
            <p className="text-gray-700"><strong>Email:</strong> {driver.email}</p>
            <p className="text-gray-700"><strong>Phone Number:</strong> {driver.phone}</p>
            <p className="text-gray-700"><strong>Start Date:</strong> {driver.startDate}</p>
          </div>

          {/* Settings Section */}
          <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold text-black">Settings</h2>
            <p className="text-gray-700"><strong>Notification Preferences:</strong> Email Notifications Enabled</p>
            <p className="text-gray-700"><strong>Password:</strong> **********</p>
          </div>

          {/* Help Section */}
          <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold text-black">Need Help?</h2>
            <p className="text-gray-700">
              If you need assistance with your account, please visit our{" "}
              <a href="/dashboard/driver/driverHelp" className="text-blue-600 hover:underline">
                Help Center
              </a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
