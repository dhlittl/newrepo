"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import SignOutButton from "@/components/SignOutButton";
import { getCurrentUser } from "aws-amplify/auth";
import ResponsiveNavbar from "./ResponsiveNavbar";

export default function DefaultNavbar() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { userId: sub } = await getCurrentUser();
        const idRes = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${sub}`);
        const { userId } = await idRes.json();

        const infoRes = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser/Info?userId=${userId}`);
        const data = await infoRes.json();
        const row = Array.isArray(data.body) ? JSON.parse(data.body)[0] : data;

        setFirst(row?.FName ?? "");
        setLast(row?.LName ?? "");
      } catch (e) {
        console.error("DefaultNavbar name fetch error:", e);
      }
    })();
  }, []);

  const navLinks = [
    <Link href="/pages/defaultUser" key="dashboard">Dashboard</Link>,
    <Link href="/pages/defaultUser/applications" key="applications">My Applications</Link>,
    <Link href="/pages/defaultUser/sponsorsPage" key="sponsors">Sponsors</Link>,
    <Link href="/pages/defaultUser/help" key="help">Help</Link>,
    <Link href="/pages/defaultUser/aboutPage" key="about">About</Link>,
    <SignOutButton key="signout" />
  ];

  return (
    <ResponsiveNavbar 
      navLinks={navLinks} 
      profileInfo={{ first, last }} 
      profilePath="/pages/defaultUser/profile" 
    />
  );
}