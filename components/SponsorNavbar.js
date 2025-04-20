"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import SignOutButton from "@/components/SignOutButton";
import { getCurrentUser } from "aws-amplify/auth";
import ResponsiveNavbar from "./ResponsiveNavbar";

export default function SponsorNavbar() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { userId: sub } = await getCurrentUser();
        const idRes = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${sub}`);
        const { userId } = await idRes.json();

        const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers/Info?userId=${userId}`);
        const raw = await res.json();
        const data = raw.body ? JSON.parse(raw.body) : raw;
        const row = Array.isArray(data) ? data[0] : data;

        setFirst(row?.FName ?? "");
        setLast(row?.LName ?? "");
      } catch (e) {
        console.error("SponsorNavbar name fetch error:", e);
      }
    })();
  }, []);

  const navLinks = [
    <Link href="/pages/sponsor" key="dashboard">Dashboard</Link>,
    <Link href="/pages/sponsor/drivers" key="drivers">My Drivers</Link>,
    <Link href="/pages/sponsor/applications" key="applications">Driver Applications</Link>,
    <Link href="/pages/sponsor/catalog" key="catalog">Product Catalog</Link>,
    <Link href="/pages/sponsor/users" key="users">Manage Users</Link>,
    <Link href="/pages/sponsor/reports" key="reports">Reports</Link>,
    <Link href="/pages/sponsor/purchase-requests" key="purchases">Purchase Requests</Link>,
    <Link href="/pages/sponsor/aboutPage" key="about">About</Link>,
    <SignOutButton key="signout" />
  ];

  return (
    <ResponsiveNavbar 
      navLinks={navLinks} 
      profileInfo={{ first, last }} 
      profilePath="/pages/sponsor/profile" 
    />
  );
}