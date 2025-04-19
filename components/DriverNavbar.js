// components/DriverNavbar.js

"use client";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { uploadData, getUrl } from "@aws-amplify/storage";
import SignOutButton from "@/components/SignOutButton";
import { useEffectiveDriverId } from "@/hooks/useEffectiveDriverId";


export default function DriverNavbar() {
  const { userId } = useEffectiveDriverId();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fileName = `profile-pictures/${userId}.jpg`;
    getUrl({
      key: fileName,
      options: { 
        accessLevel: "public", 
        validateObjectExistence: true 
      }
    })
    .then(({ url }) => setAvatarUrl(url))
    .catch(() => {
      // no picture found → leave avatarUrl null so we render the icon
    });
  }, [userId]);

  return (
    <nav className="navbar">
        <ul>
          <li><a href="/pages/driver">Dashboard</a></li>
          <li><a href="/pages/driver/sponsorInfo">My Sponsors</a></li>
          <li><a href="/pages/driver/applications">My Applications</a></li>
          <li><a href="/pages/driver/notifications">Notification Preferences</a></li>
          <li><a href="/pages/driver/driverHelp">Help</a></li>
          <li><a href="/pages/driver/aboutPage">About</a></li>
          <li><a>
            <SignOutButton />
          </a></li>
        </ul>

        <Link href="/pages/driver/profile">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
            />
          ) : (
            <UserIcon className="w-10 h-10 text-blue-600" />
          )}
      </Link>
    </nav>
  );
}