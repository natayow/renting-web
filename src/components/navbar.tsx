"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RiHome9Fill } from "react-icons/ri";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    router.push(`/properties?${params.toString()}`);
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (mobileSearchQuery.trim()) {
      params.set("search", mobileSearchQuery.trim());
    }
    router.push(`/properties?${params.toString()}`);
    setIsMobileSearchOpen(false);
    setMobileSearchQuery("");
  };

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
          <form
            onSubmit={handleSearch}
            className="hidden xl:flex items-center bg-white border-2 border-[#064749] rounded-full shadow-sm hover:shadow-md transition-shadow w-full max-w-4xl"
          >
            <div className="flex w-full items-center gap-2 px-5 py-3 cursor-pointer hover:bg-gray-50 rounded-l-full transition-colors min-w-0">
              <svg
                className="w-5 h-5 text-gray-600 shrink-0"
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
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, city, or address"
                className="outline-none text-sm text-gray-900 placeholder-gray-600 bg-transparent w-full font-medium"
              />
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
              <svg
                className="w-5 h-5 text-gray-600 shrink-0"
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
              <span className="text-sm text-gray-600 font-medium">Move-in</span>
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-sm text-gray-600 font-medium">
                Move-out
              </span>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
              <svg
                className="w-5 h-5 text-gray-600 shrink-0"
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
              <span className="text-sm text-gray-600 font-medium">Guests</span>
              <div className="flex items-center gap-2 ml-1">
                <button
                  type="button"
                  className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-gray-700 hover:border-gray-600 hover:bg-gray-50 transition-all font-medium text-lg"
                >
                  +
                </button>
                <span className="text-sm font-semibold text-gray-900 min-w-5 text-center">
                  1
                </span>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-gray-700 hover:border-gray-600 hover:bg-gray-50 transition-all font-medium text-lg pb-0.5"
                >
                  −
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#064749] text-white pl-8 pr-10 py-3 rounded-r-full hover:bg-[#053638] transition-all font-semibold text-base"
            >
              Search
            </button>
          </form>

          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="xl:hidden flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-300 rounded-full hover:shadow-md transition-all bg-white relative z-10 cursor-pointer"
          >
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

        {/* Mobile Search Modal */}
        {isMobileSearchOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 xl:hidden"
            onClick={() => setIsMobileSearchOpen(false)}
          >
            <div
              className="bg-white rounded-b-2xl shadow-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Properties
                </h3>
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleMobileSearch}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    placeholder="Search properties..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-[#064749] text-white px-6 py-3 rounded-lg hover:bg-[#053638] transition-all font-medium"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                        <div
                          className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            router.push("/admin/properties/new");
                            setIsMenuOpen(false);
                          }}
                        >
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            Add property to rent
                          </h3>
                          <p className="text-xs text-gray-600">
                            List a new property for tenants to rent.
                          </p>
                        </div>
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
