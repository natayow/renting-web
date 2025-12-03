"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RiHome9Fill } from "react-icons/ri";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Get the first letter of the user's full name or show profile icon
  const renderAvatar = () => {
    if (session?.user?.fullName) {
      return (
        <span className="text-white font-semibold text-sm">
          {session.user.fullName.charAt(0).toUpperCase()}
        </span>
      );
    }
    return (
      <svg
        className="w-4 h-4 md:w-5 md:h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    );
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 shadow-md bg-white">
      <div className="flex items-center justify-between h-16 md:h-20 px-4 sm:px-6 md:px-[65px]">
        <Link
          href="/"
          aria-label="Homepage"
          className="flex items-center shrink-0"
        >
          <div className="flex items-center flex-col">
            <RiHome9Fill className="text-3xl md:text-4xl text-[#064749]" />
            <p className="text-[#064749] text-xs md:text-base font-light">
              FLEX LIVING
            </p>
          </div>
        </Link>

        <div className="flex items-center justify-center flex-1 mx-2 md:mx-4">
          <div className="hidden xl:flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-l-full transition-colors">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Select a city
              </span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Move-in
              </span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Move-out
              </span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Guests
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                <button className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:shadow-sm transition-all">
                  <span className="text-base leading-none pb-0.5">+</span>
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-4 text-center">
                  1
                </span>
                <button className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:shadow-sm transition-all">
                  <span className="text-base leading-none pb-0.5">−</span>
                </button>
              </div>
            </div>
            <button className="bg-[#064749] text-white px-8 py-2 rounded-r-full hover:bg-[#053638] transition-all font-medium text-sm">
              Search
            </button>
          </div>

          <button className="xl:hidden flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-300 rounded-full hover:shadow-md transition-all bg-white relative z-10 cursor-pointer">
            <svg
              className="w-4 h-4 text-gray-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-xs md:text-sm text-gray-600 pointer-events-none">
              Search
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0 relative z-20">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 pr-1.5 md:pr-2 py-1.5 md:py-2 border border-gray-300 rounded-full hover:shadow-md transition-all bg-white"
            >
              <svg
                className="w-4 md:w-5 h-4 md:h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#064749] flex items-center justify-center">
                {renderAvatar()}
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-3"></div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      {session?.user?.role === "ADMIN" ? (
                        <Link
                          href="/add-property"
                          className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            Add property to rent
                          </h3>
                          <p className="text-xs text-gray-600">
                            List a new property for tenants to rent.
                          </p>
                        </Link>
                      ) : (
                        <Link
                          href="/become-tenant"
                          className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            Become a tenant
                          </h3>
                          <p className="text-xs text-gray-600">
                            It&apos;s easy to start hosting and earn extra
                            income.
                          </p>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-1">
                  {session ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: "/" });
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Login or Register
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
