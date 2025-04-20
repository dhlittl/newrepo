// components/Navbar.js

"use client";

import { usePathname } from "next/navigation";
import AdminNavbar from "./AdminNavbar";
import DriverNavbar from "./DriverNavbar";
import SponsorNavbar from "./SponsorNavbar";
import DefaultNavbar from "./DefaultNavbar";

const Navbar = () => {
  const pathname = usePathname(); // Get the current route path

  // Conditionally render the navbar based on the route
  if (pathname.startsWith("/pages/admin")) {
    return <AdminNavbar />;
  } else if (pathname.startsWith("/pages/driver")) {
    return <DriverNavbar />;
  } else if (pathname.startsWith("/pages/sponsor")) {
    return <SponsorNavbar />;
  } else if (pathname.startsWith("/pages/defaultUser")) {
    return <DefaultNavbar />;
  }
  
  // Return null if no matching path
  return null;
};

export default Navbar;