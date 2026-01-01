"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaIdCard,
  FaEdit,
} from "react-icons/fa";
import axiosInstance from "@/utils/axiosInstance";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  role: string;
  createdAt: string;
}

interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPriceIdr: number;
  property: {
    id: string;
    title: string;
  };
  room: {
    id: string;
    name: string;
  } | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.accessToken) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/api/auth/user/${session.user.id}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );

        setProfile(response.data.data);
        setError("");
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      if (!session?.user?.accessToken) return;

      // Only fetch bookings for USER role
      if (session.user.role?.toUpperCase() !== "USER") return;

      try {
        const response = await axiosInstance.get(`/api/bookings/user/me`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });

        if (response.data.success) {
          setBookings(response.data.data);
        }
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        // Don't set error for bookings, just log it
      }
    };

    if (session) {
      fetchProfile();
      fetchBookings();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#064749] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xl font-semibold mb-2">Error</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "px-4 py-1.5 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-semibold shadow-md border-2 border-purple-300";
      case "TENANT":
        return "px-4 py-1.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-semibold shadow-md border-2 border-blue-300";
      case "USER":
        return "px-4 py-1.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-semibold shadow-md border-2 border-green-300";
      default:
        return "px-4 py-1.5 bg-linear-to-r from-gray-500 to-gray-600 text-white rounded-full text-sm font-semibold shadow-md border-2 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="h-32 bg-linear-to-r from-[#064749] via-[#087174] to-[#0a9399]"></div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-[#064749] to-[#0a9399] flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white">
                {profile && getInitials(profile.fullName)}
              </div>
              <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {profile?.fullName}
                  </h1>
                  <span className={getRoleBadgeStyle(profile?.role || "")}>
                    {profile?.role}
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                  <span className="text-sm">
                    Member since {formatDate(profile?.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {profile?.role?.toUpperCase() === "USER" && (
                  <button className="px-6 py-3 bg-linear-to-r from-[#064749] to-[#0a9399] text-white rounded-full hover:from-[#053638] hover:to-[#087174] transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Become a Tenant
                  </button>
                )}
                <button className="px-6 py-3 bg-[#064749] text-white rounded-full hover:bg-[#053638] transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium">
                  <FaEdit />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-[#064749] to-[#0a9399] rounded-xl flex items-center justify-center">
                <FaUser className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Personal Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Full Name
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                  <FaIdCard className="text-[#064749] text-lg" />
                  <p className="text-gray-900 font-medium">
                    {profile?.fullName}
                  </p>
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Gender
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-[#064749]"
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
                  <p className="text-gray-900 font-medium capitalize">
                    {profile?.gender || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Date of Birth
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                  <FaCalendarAlt className="text-[#064749] text-lg" />
                  <p className="text-gray-900 font-medium">
                    {formatDate(profile?.dateOfBirth)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-[#064749] to-[#0a9399] rounded-xl flex items-center justify-center">
                <FaEnvelope className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Contact Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Email Address
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                  <FaEnvelope className="text-[#064749] text-lg" />
                  <p className="text-gray-900 font-medium break-all">
                    {profile?.email}
                  </p>
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Phone Number
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                  <FaPhone className="text-[#064749] text-lg" />
                  <p className="text-gray-900 font-medium">
                    {profile?.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {profile?.role?.toUpperCase() === "ADMIN" ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Manage Property
              </h2>
            </div>

            <div className="bg-linear-to-br from-purple-50 via-purple-100 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Property Management
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Manage all your properties, view listings, update
                  availability, and track bookings from a centralized dashboard
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => router.push("/admin/properties/new")}
                  className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 group cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors duration-200">
                      <svg
                        className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors duration-200">
                        Add New
                      </p>
                      <p className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                        Property
                      </p>
                    </div>
                  </div>
                </button>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Edit & Update</p>
                      <p className="text-lg font-bold text-gray-900">
                        Listings
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-pink-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">View</p>
                      <p className="text-lg font-bold text-gray-900">
                        Analytics
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/admin/properties")}
                className="w-full py-4 bg-linear-to-r from-purple-600 via-purple-700 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:via-purple-800 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold text-lg group mb-4"
              >
                <svg
                  className="w-6 h-6 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Go to Property Management Dashboard
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Account Statistics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium mb-1">
                        Total Bookings
                      </p>
                      <p className="text-3xl font-bold text-blue-900">
                        {bookings.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium mb-1">
                        Favorites
                      </p>
                      <p className="text-3xl font-bold text-green-900">0</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium mb-1">
                        Reviews
                      </p>
                      <p className="text-3xl font-bold text-purple-900">0</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            {bookings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  My Bookings
                </h2>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        router.push(`/booking/success?bookingId=${booking.id}`)
                      }
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.property.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Room: {booking.room?.name || "N/A"}
                          </p>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
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
                              {new Date(booking.checkInDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                              {" → "}
                              {new Date(
                                booking.checkOutDate
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              booking.status === "CONFIRMED"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "WAITING_CONFIRMATION"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.status === "WAITING_PAYMENT"
                                ? "bg-orange-100 text-orange-800"
                                : booking.status === "CANCELED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.status.replace(/_/g, " ")}
                          </span>
                          <p className="text-lg font-bold text-[#064749]">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(booking.totalPriceIdr)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
