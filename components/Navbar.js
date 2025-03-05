"use client";

import { usePathname } from "next/navigation";
import AdminNavbar from "./AdminNavbar";
import DriverNavbar from "./DriverNavbar";
import SponsorNavbar from "./SponsorNavbar";

const Navbar = () => {
  const pathname = usePathname(); // Get the current route path

  // Conditionally render the navbar based on the route
  if (pathname.startsWith("/pages/admin")) {
    return <AdminNavbar />;
  } else if (pathname.startsWith("/pages/driver")) {
    return <DriverNavbar />;
  } else if (pathname.startsWith("/pages/sponsor")) {
    return <SponsorNavbar />;
  }

  return <div>Default Navbar</div>; // Optional default navbar
};

export default Navbar;
