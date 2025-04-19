"use client";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { getUrl } from "@aws-amplify/storage";
import SignOutButton from "@/components/SignOutButton";
import { useEffectiveDriverId } from "@/hooks/useEffectiveDriverId";

export default function DriverNavbar() {
  const { userId } = useEffectiveDriverId();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fileName = `profile-pictures/${userId}.jpg`;
    getUrl({
      key: fileName,
      options: {
        accessLevel: "public",
        validateObjectExistence: true,
      },
    })
      .then(({ url }) => setAvatarUrl(url))
      .catch(() => null);

    (async () => {
      try {
        const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Info?userId=${userId}`);
        const raw = await res.json();
        const data = raw.body ? JSON.parse(raw.body) : raw;
        const row = Array.isArray(data) ? data[0] : data;
        setFirst(row?.FName ?? "");
        setLast(row?.LName ?? "");
      } catch (err) {
        console.error("DriverNavbar name fetch error:", err);
      }
    })();
  }, [userId]);

  return (
    <nav className="navbar flex justify-between items-center px-4 py-2 bg-white shadow">
      <ul className="flex space-x-4">
        <li><Link href="/pages/driver">Dashboard</Link></li>
        <li><Link href="/pages/driver/catalog">Catalog</Link></li>
        <li><Link href="/pages/driver/sponsorInfo">My Sponsors</Link></li>
        <li><Link href="/pages/driver/notifications">Notification Preferences</Link></li>
        <li><Link href="/pages/driver/driverHelp">Help</Link></li>
        <li><Link href="/pages/driver/aboutPage">About</Link></li>
        <li><SignOutButton /></li>
      </ul>

      <div className="flex items-center space-x-3">
        <div className="flex flex-col items-start leading-tight">
          <span className="text-sm font-medium text-gray-800">{first}</span>
          <span className="text-sm font-medium text-gray-800">{last}</span>
        </div>
        <Link href="/pages/driver/profile">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" />
          ) : (
            <UserIcon className="w-10 h-10 text-blue-600" />
          )}
        </Link>
      </div>
    </nav>
  );
}
