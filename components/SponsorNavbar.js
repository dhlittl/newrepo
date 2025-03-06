"use client";
export default function SponsorNavbar() {
    return (
      <nav className="navbar">
        <ul>
          <li><a href="/pages/sponsor">Dashboard</a></li>
          <li><a href="/pages/sponsor/drivers">My Drivers</a></li>
          <li><a href="/pages/sponsor/applications">Driver Applications</a></li>
          <li><a href="/pages/sponsor/reports">Reports</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>
    );
  }
  