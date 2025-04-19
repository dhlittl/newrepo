// components/SponsorNavbar.js

"use client";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import SignOutButton from "@/components/SignOutButton";

export default function SponsorNavbar() {
    return (
      <nav className="navbar">
        <ul>
          <li><a href="/pages/sponsor">Dashboard</a></li>
          <li><a href="/pages/sponsor/drivers">My Drivers</a></li>
          <li><a href="/pages/sponsor/applications">Driver Applications</a></li>
          <li><a href="/pages/sponsor/catalog">Product Catalog</a></li>
          <li><a href="/pages/sponsor/users">Manage Users</a></li>
          <li><a href="/pages/sponsor/reports">Reports</a></li>
          <li><a>
            <SignOutButton />
          </a></li>
        </ul>

        {/* Profile Icon in Top Right Corner */}
        <div className="absolute top+1 right-4">
          <Link href="/pages/sponsor/profile">
            <UserIcon className="w-10 h-10 text-blue-600" />
          </Link>
        </div>
      </nav>
    );
  }
  