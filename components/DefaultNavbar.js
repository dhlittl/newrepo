"use client";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import SignOutButton from "@/components/SignOutButton";

export default function DefaultNavbar() {
    return (
      <nav className="navbar">
        <ul>
          <li><a href="/pages/defaultUser">Dashboard</a></li>
          <li><a href="/pages/defaultUser/applications">My Applications</a></li>
          <li><a href="/pages/defaultUser/sponsorsPage">Sponsors</a></li>
          <li><a href="/pages/help">Help</a></li>
          <li><a href="/pages/aboutPage">About</a></li>
          <li><a>
            <SignOutButton />
          </a></li>
        </ul>

        {/* Profile Icon in Top Right Corner */}
        <div className="absolute top+1 right-4">
          <Link href="/pages/defaultUser/profile">
            <UserIcon className="w-10 h-10 text-blue-600" />
          </Link>
        </div>
      </nav>
    );
  }