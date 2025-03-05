"use client";
export default function DriverNavbar() {
    return (
        <nav className="navbar">
        <ul>
          <li><a href="/pages/driver">Dashboard</a></li>
          <li><a href="/pages/driver/driverHelp">Help</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>
    );
  }
  