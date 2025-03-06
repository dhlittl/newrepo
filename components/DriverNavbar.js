"use client";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";


export default function DriverNavbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 relative">
      <div className="flex justify-between items-center p-4">
        <ul className="flex space-x-4">
          <li><Link href="/pages/driver">Dashboard</Link></li>
          <li><Link href="/pages/driver/driverHelp">Help</Link></li>
          <li><Link href="/logout">Logout</Link></li>
        </ul>

        {/* Profile Icon in Top Right Corner */}
        <div className="absolute top-3 right-4">
          <Link href="/pages/driver/profile" className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition">
            <UserIcon className="w-12 h-5 text-blue-600" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
