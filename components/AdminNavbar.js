"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "aws-amplify/auth";
import SignOutButton from "@/components/SignOutButton";

const mapCognitoToUserId = (sub) =>
  `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${sub}`;

const adminInfoUrl = (id) =>
  `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Admin/profile?User_ID=${id}`;

export default function AdminNavbar() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { userId: cognitoSub } = await getCurrentUser();
        if (!cognitoSub) throw new Error("Missing Cognito sub");

        const mapRes = await fetch(mapCognitoToUserId(cognitoSub));
        const mapJson = await mapRes.json();
        const userId = mapJson.userId;
        if (!userId) throw new Error("User ID not found");

        const profileRes = await fetch(adminInfoUrl(userId));
        const profileJson = await profileRes.json();
        const row = Array.isArray(profileJson) ? profileJson[0] : profileJson;

        setFirst(row?.FName ?? "");
        setLast(row?.LName ?? "");
      } catch (err) {
        console.error("[AdminNavbar] Fetch error:", err);
      }
    })();
  }, []);

  return (
    <nav className="navbar flex justify-between items-center px-4 py-2 bg-white shadow">
      {/* Navigation links */}
      <ul className="flex space-x-4">
        <li><Link href="/pages/admin">Dashboard</Link></li>
        <li><Link href="/pages/admin/logs">Audit Logs</Link></li>
        <li><Link href="/pages/admin/sponsorPolicies">Sponsors</Link></li>
        <li><Link href="/pages/admin/users">Manage Users</Link></li>
        <li><Link href="/pages/admin/aboutPage">About</Link></li>
        <li><SignOutButton /></li>
      </ul>

      {/* Stacked name (left-aligned) + profile icon */}
      <div className="flex items-center space-x-3">
        {(first || last) && (
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-medium text-gray-800">{first}</span>
            <span className="text-sm font-medium text-gray-800">{last}</span>
          </div>
        )}
        <Link href="/pages/admin/profile" className="block">
          <UserIcon className="w-10 h-10 text-blue-600 shrink-0" />
        </Link>
      </div>
    </nav>
  );
}
