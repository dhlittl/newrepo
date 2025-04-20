"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ResponsiveNavbar({ navLinks, profileInfo, profilePath, profileComponent }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [first, setFirst] = useState(profileInfo?.first || "");
  const [last, setLast] = useState(profileInfo?.last || "");

  useEffect(() => {
    if (profileInfo?.first) setFirst(profileInfo.first);
    if (profileInfo?.last) setLast(profileInfo.last);
  }, [profileInfo]);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMenuOpen]);

  // Close the menu when window is resized above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Close mobile menu when clicking a navigation link
  const handleNavLinkClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="navbar flex justify-between items-center px-4 py-2 bg-white shadow relative z-10">
      {/* Mobile menu button - only visible on small screens */}
      <button 
        className="menu-button lg:hidden text-blue-600 focus:outline-none" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? 
          <XMarkIcon className="w-8 h-8" /> : 
          <Bars3Icon className="w-8 h-8" />
        }
      </button>

      {/* Desktop navigation - hidden on mobile */}
      <div className="hidden lg:block">
        <ul className="flex space-x-4">
          {navLinks.map((link, index) => (
            <li key={index} onClick={handleNavLinkClick}>{link}</li>
          ))}
        </ul>
      </div>

      {/* Mobile menu - sliding panel */}
      <div 
        className={`mobile-menu lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end p-4">
          <button 
            onClick={() => setIsMenuOpen(false)} 
            className="text-blue-600 focus:outline-none"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <ul className="flex flex-col space-y-4 p-4">
          {navLinks.map((link, index) => (
            <li key={index} className="py-2" onClick={handleNavLinkClick}>
              {link}
            </li>
          ))}
        </ul>
      </div>

      {/* User profile section */}
      <div className="flex items-center space-x-3">
        {(first || last) && (
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-medium text-gray-800">{first}</span>
            <span className="text-sm font-medium text-gray-800">{last}</span>
          </div>
        )}
        {profileComponent ? (
          profileComponent
        ) : (
          <Link href={profilePath}>
            <UserIcon className="w-10 h-10 text-blue-600 shrink-0" />
          </Link>
        )}
      </div>
      
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 lg:hidden z-10"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}