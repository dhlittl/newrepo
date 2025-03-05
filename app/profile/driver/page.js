// Driver Profile

"use client";
import { useEffect, useState } from "react";

export default function DriverProfilePage() {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedDriver, setUpdatedDriver] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
  });

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

        const transformedData = {
          id: data[0].User_ID,
          fname: data[0].FName,
          lname: data[0].LName,
          email: data[0].Email,
          phone: data[0].Phone_Number,
          startDate: data[0].Start_Date,
        };

        setDriver(transformedData);
        setUpdatedDriver({
          fname: data[0].FName,
          lname: data[0].LName,
          email: data[0].Email,
          phone: data[0].Phone_Number,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverProfile();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDriver((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const requestBody = {
            User_ID: driver.id, // Ensure this is an integer
            FName: updatedDriver.fname || driver.fname,
            LName: updatedDriver.lname || driver.lname,
            Email: updatedDriver.email || driver.email,
            Phone_Number: updatedDriver.phone || driver.phone
        };

        console.log("Sending request body:", requestBody); // Debugging

        const response = await fetch(
            "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/profile",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            }
        );

        const responseData = await response.json();
        console.log("Response Data:", responseData);

        if (!response.ok) {
            throw new Error(responseData.error || "Failed to update profile");
        }

        setDriver({
            ...driver,
            fname: updatedDriver.fname,
            lname: updatedDriver.lname,
            email: updatedDriver.email,
            phone: updatedDriver.phone
        });

        setIsEditing(false); // Close edit form
    } catch (err) {
        console.error("Error updating profile:", err);
        setError(err.message);
    }
};

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
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="fname"
                    value={updatedDriver.fname}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lname"
                    value={updatedDriver.lname}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={updatedDriver.email}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={updatedDriver.phone}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-lg"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div>
                <p className="text-gray-700"><strong>User ID:</strong> {driver.id}</p>
                <p className="text-gray-700"><strong>Name:</strong> {driver.fname} {driver.lname}</p>
                <p className="text-gray-700"><strong>Email:</strong> {driver.email}</p>
                <p className="text-gray-700"><strong>Phone Number:</strong> {driver.phone}</p>
                <p className="text-gray-700"><strong>Start Date:</strong> {driver.startDate}</p>
              </div>
            )}

            {/* Toggle Edit Button */}
            <div className="mt-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
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
