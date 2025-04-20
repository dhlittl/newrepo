"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "aws-amplify/auth";
import SignOutButton from "@/components/SignOutButton";
import ResponsiveNavbar from "./ResponsiveNavbar";

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

  const navLinks = [
    <Link href="/pages/admin" key="dashboard">Dashboard</Link>,
    <Link href="/pages/admin/logs" key="logs">Audit Logs</Link>,
    <Link href="/pages/admin/sponsorPolicies" key="sponsors">Sponsors</Link>,
    <Link href="/pages/admin/users" key="users">Manage Users</Link>,
    <Link href="/pages/admin/aboutPage" key="about">About</Link>,
    <SignOutButton key="signout" />
  ];

  return (
    <ResponsiveNavbar 
      navLinks={navLinks} 
      profileInfo={{ first, last }} 
      profilePath="/pages/admin/profile" 
    />
  );
}