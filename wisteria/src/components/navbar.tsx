"use client";

import Image from "next/image";
import React from "react";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const Navbar = () => {
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push("/signin");
        // If you're using any client-side state management (like React Context)
        // you would also want to clear the auth state here
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const goToProfile = () => {
    router.push("/profile");
  };

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-md px-8 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={120}
          height={40}
          className="h-10 w-auto"
        />
        <h1 className="ml-2 text-2xl font-bold text-gray-800">agri</h1>
      </div>
      <div className="flex items-center gap-6">
        <Link
          href="/home"
          className="text-gray-700 hover:text-blue-700 font-medium"
        >
          Dashboard
        </Link>
        <Link
          href="/lists"
          className="text-gray-700 hover:text-blue-700 font-medium"
        >
          Lists
        </Link>
        <div className="relative">
          <button
            ref={buttonRef}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-all"
            onClick={() => setShowDropdown((v) => !v)}
          >
            Account
          </button>
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2 flex flex-col"
            >
              <button
                className="px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition rounded-t-lg"
                onClick={() => {
                  setShowDropdown(false);
                  goToProfile();
                }}
              >
                View Profile
              </button>
              <button
                className="px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition rounded-t-lg"
                onClick={() => {
                  setShowDropdown(false);
                  handleLogout();
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
