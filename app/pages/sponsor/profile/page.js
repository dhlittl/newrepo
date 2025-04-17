// Sponsor User Profile

"use client";
import { useEffect, useState } from "react";
import { uploadData, getUrl } from 'aws-amplify/storage';
import { withAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from 'aws-amplify/auth';
import { getCurrentUser } from 'aws-amplify/auth';


function SponsorUserProfilePage() {
    const [cognitoSub, setCognitoSub] = useState(null);
    const [userId, setUserId] = useState(null);
    const [sponsorUser, setSponsorUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedSponsorUser, setUpdatedSponsorUser] = useState({
        fname: "",
        lname: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        async function fetchUser() {
            try {
            const user = await getCurrentUser();
            setCognitoSub(user.userId);
                
            console.log("Fetched Cognito user ID:", user.userId);
            } catch (error) {
            console.error("Error fetching current user:", error);
            }
        }

        fetchUser();
    }, []);
    
    // using cognito_sub to get user_id
    useEffect(() => {
        async function fetchDatabaseUserId() {
            try {
            const user = await getCurrentUser();
            const cognitoSub = user.userId;
            console.log("Cognito Sub:", cognitoSub);
                
            const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${cognitoSub}`);
            const data = await response.json();
                
            if (response.ok && data.userId) {
                setUserId(data.userId);
                console.log("Database User ID:", data.userId);
                //fetchWidgetOrder(data.userId);
            } else {
                console.error("Error fetching database user ID:", data.error || "Unknown error");
            }
            } catch (error) {
            console.error("Error in user ID mapping:", error);
            }
        }

        fetchDatabaseUserId();
    }, []);

    useEffect(() => {
        const fetchSponsorUserProfile = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                const response = await fetch(
                    `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/profile?User_ID=${userId}`
                );
                if (!response.ok) {
                    throw new Error(`Failed to fetch sponsor user profile: ${response.statusText}`);
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

                setSponsorUser(transformedData);
                setUpdatedSponsorUser({
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

        fetchSponsorUserProfile();
    }, [userId]);


    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setUpdatedSponsorUser((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestBody = {
                User_ID: sponsorUser.id,
                FName: updatedSponsorUser.fname || sponsorUser.fname,
                LName: updatedSponsorUser.lname || sponsorUser.lname,
                Email: updatedSponsorUser.email || sponsorUser.email,
                Phone_Number: updatedSponsorUser.phone || sponsorUser.phone
            };

            console.log("Sending request body:", requestBody); // debugging

            const response = await fetch(
                "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/profile",
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

            setSponsorUser({
                ...sponsorUser,
                fname: updatedSponsorUser.fname,
                lname: updatedSponsorUser.lname,
                email: updatedSponsorUser.email,
                phone: updatedSponsorUser.phone
            });

            setIsEditing(false); // close edit form
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
        {!loading && !error && !sponsorUser && (
            <p className="text-gray-500">No sponsor user profile found.</p>
        )}

        {!loading && !error && sponsorUser && (
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
                        value={updatedSponsorUser.fname}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                    />
                    </div>
                    <div className="mb-4">
                    <label className="block text-gray-700">Last Name</label>
                    <input
                        type="text"
                        name="lname"
                        value={updatedSponsorUser.lname}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                    />
                    </div>
                    <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={updatedSponsorUser.email}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                    />
                    </div>
                    <div className="mb-4">
                    <label className="block text-gray-700">Phone Number</label>
                    <input
                        type="text"
                        name="phone"
                        value={updatedSponsorUser.phone}
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
                    <p className="text-gray-700"><strong>User ID:</strong> {sponsorUser.id}</p>
                    <p className="text-gray-700"><strong>Name:</strong> {sponsorUser.fname} {sponsorUser.lname}</p>
                    <p className="text-gray-700"><strong>Email:</strong> {sponsorUser.email}</p>
                    <p className="text-gray-700"><strong>Phone Number:</strong> {sponsorUser.phone}</p>
                    <p className="text-gray-700"><strong>Start Date:</strong> {sponsorUser.startDate}</p>
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
            </div>
        )}
        </div>
    );
    }

    export default withAuthenticator(SponsorUserProfilePage);