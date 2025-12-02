import React from "react";
import Image from "next/image";
import Link from "next/link";
import { RiHome9Fill } from "react-icons/ri";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 shadow-md bg-white">
      <div className="grid grid-cols-3 items-center h-20 px-4 sm:px-6 md:px-[65px] gap-4">
        <Link href="/" aria-label="Homepage" className="flex items-center">
          <div className="flex items-center flex-col">
            <RiHome9Fill className="text-4xl text-[#064749]" />
            <p className="text-[#064749] text-base font-light">FLEX LIVING</p>
          </div>
        </Link>

        <div className="flex items-center justify-center">
          <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-gray-50 rounded-l-full transition-colors">
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
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
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
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
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
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
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
              <div className="flex items-center gap-1.5 ml-1">
                <button className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:shadow-md transition-all">
                  <span className="text-base leading-none pb-0.5">+</span>
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-4 text-center">
                  1
                </span>
                <button className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:shadow-md transition-all">
                  <span className="text-base leading-none pb-0.5">−</span>
                </button>
              </div>
            </div>
            <button className="bg-[#064749] text-white px-6 py-2.5 rounded-r-full hover:bg-[#053638] hover:shadow-lg transition-all font-medium text-sm">
              Search
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-self-end">
          <Link
            href="/hosting"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:shadow-md rounded-full transition-all"
          >
            <span>Switch to hosting</span>
          </Link>

          <button className="w-12 h-12 rounded-full bg-[#064749] flex items-center justify-center text-white font-semibold hover:bg-[#053638] hover:shadow-lg transition-all">
            N
          </button>
        </div>
      </div>
    </nav>
  );
}
