// components/SponsorNavbar.js

"use client";
import SignOutButton from "@/components/SignOutButton";

export default function SponsorNavbar() {
    return (
      <nav className="navbar">
        <ul>
          <li><a href="/pages/sponsor">Dashboard</a></li>
          <li><a href="/pages/sponsor/drivers">My Drivers</a></li>
          <li><a href="/pages/sponsor/applications">Driver Applications</a></li>
          <li><a href="/pages/sponsor/catalog">Product Catalog</a></li>
          <li><a href="/pages/sponsor/reports">Reports</a></li>
          <li><a>
            <SignOutButton />
          </a></li>
        </ul>
      </nav>
    );
  }
  