"use client";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getUrl } from "@aws-amplify/storage";
import SignOutButton from "@/components/SignOutButton";
import { useEffectiveDriverId } from "@/hooks/useEffectiveDriverId";
import ResponsiveNavbar from "./ResponsiveNavbar";

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

  const navLinks = [
    <Link href="/pages/driver" key="dashboard">Dashboard</Link>,
    <Link href="/pages/driver/sponsorInfo" key="sponsors">My Sponsors</Link>,
    <Link href="/pages/driver/notifications" key="notifications">Notifications</Link>,
    <Link href="/pages/driver/purchase-history" key="purchases">Purchases</Link>,
    <Link href="/pages/driver/driverHelp" key="help">Help</Link>,
    <Link href="/pages/driver/aboutPage" key="about">About</Link>,
    <SignOutButton key="signout" />
  ];

  // Custom profile component that handles avatar
  const ProfileComponent = (
    <Link href="/pages/driver/profile">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" />
      ) : (
        <UserIcon className="w-10 h-10 text-blue-600" />
      )}
    </Link>
  );

  return (
    <ResponsiveNavbar 
      navLinks={navLinks} 
      profileInfo={{ first, last }} 
      profilePath="/pages/driver/profile" 
      profileComponent={ProfileComponent}
    />
  );
}