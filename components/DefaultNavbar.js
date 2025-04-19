"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import SignOutButton from "@/components/SignOutButton";
import { getCurrentUser } from "aws-amplify/auth";

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

  return (
    <nav className="navbar flex justify-between items-center px-4 py-2 bg-white shadow">
      <ul className="flex space-x-4">
        <li><Link href="/pages/defaultUser">Dashboard</Link></li>
        <li><Link href="/pages/defaultUser/applications">My Applications</Link></li>
        <li><Link href="/pages/defaultUser/sponsorsPage">Sponsors</Link></li>
        <li><Link href="/pages/defaultUser/help">Help</Link></li>
        <li><Link href="/pages/defaultUser/aboutPage">About</Link></li>
        <li><SignOutButton /></li>
      </ul>

      <div className="flex items-center space-x-3">
        <div className="flex flex-col items-start leading-tight">
          <span className="text-sm font-medium text-gray-800">{first}</span>
          <span className="text-sm font-medium text-gray-800">{last}</span>
        </div>
        <Link href="/pages/defaultUser/profile">
          <UserIcon className="w-10 h-10 text-blue-600" />
        </Link>
      </div>
    </nav>
  );
}
