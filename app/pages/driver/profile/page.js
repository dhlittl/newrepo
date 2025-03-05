// Driver Profile

"use client"
import  React , { useState } from 'react';
import Link from 'next/link';

export default function DriverProfilePage() {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Your Profile</h1>

            {/* User Profile Section */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="space-y-4">
                    <p><strong>Name:</strong> John Doe</p>
                    <p><strong>Email:</strong> johndoe@example.com</p>
                    <p><strong>Member Since:</strong> January 2025</p>
                </div>
            </section>

            {/* Settings Section */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Settings</h2>
                <div className="space-y-4">
                    <p><strong>Notification Preferences:</strong> Email Notifications Enabled</p>
                    <p><strong>Password:</strong> **********</p>
                    {/*<Link href="/profile/edit" passHref>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                        Edit Profile
                        </button>
                    </Link>*/}
                </div>
            </section>

            {/* Help Section */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
                <p>If you need assistance with your account, please visit our <Link href="/dashboard/driver/driverHelp" className="text-blue-600">Help Center</Link>.</p>
            </section>
        </div>
    );
}