"use client";
export default function DefaultNavbar() {
    return (
      <nav className="navbar">
        <ul>
          <li><a href="/pages/defaultUser">Dashboard</a></li>
          <li><a href="/pages/defaultUser/applyForm">Application Form</a></li>
          <li><a href="/pages/defaultUser/sponsorsPage">Sponsors</a></li>
          <li><a href="/pages/help">Help</a></li>
          <li><a href="/">About</a></li>
        </ul>
      </nav>
    );
  }