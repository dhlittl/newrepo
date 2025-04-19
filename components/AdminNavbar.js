// components/AdminNavbar.js

"use client";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import SignOutButton from "@/components/SignOutButton"

export default function AdminNavbar() {
    return (
      <nav className="navbar">
        <ul>
          <li><a href="/pages/admin">Dashboard</a></li>
          <li><a href="/pages/admin/logs">Audit Logs</a></li>
          <li><a href="/pages/admin/sponsorPolicies">Sponsors</a></li>
          <li><a href="/pages/admin/users">Manage Users</a></li>
          <li><a href="/pages/admin/aboutPage">About</a></li>
          <li><a>
            <SignOutButton />
          </a></li>
        </ul>

        {/* Profile Icon in Top Right Corner */}
        <div className="absolute top+1 right-4">
          <Link href="/pages/admin/profile">
            <UserIcon className="w-10 h-10 text-blue-600" />
          </Link>
        </div>
      </nav>
    );
  }
  