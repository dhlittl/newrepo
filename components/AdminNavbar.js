// components/AdminNavbar.js

"use client";
export default function AdminNavbar() {
    return (
      <nav className="navbar">
        <ul>
          <li><a href="/pages/admin">Dashboard</a></li>
          <li><a href="/pages/admin/logs">Audit Logs</a></li>
          <li><a href="/pages/admin/helpDesk">Help Desk</a></li>
          <li><a href="/pages/admin/sponsorPolicies">Sponsors</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>
    );
  }
  