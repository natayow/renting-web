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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

    if (session) {
      fetchProfile();
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {profile?.fullName}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                  <span className="px-3 py-1 bg-[#064749] bg-opacity-10 text-[#064749] rounded-full text-sm font-medium capitalize">
                    {profile?.role}
                  </span>
                  <span className="text-sm">
                    Member since {formatDate(profile?.createdAt)}
                  </span>
                </div>
              </div>
              <button className="px-6 py-3 bg-[#064749] text-white rounded-full hover:bg-[#053638] transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium">
                <FaEdit />
                Edit Profile
              </button>
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
                  <p className="text-3xl font-bold text-blue-900">0</p>
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
      </div>
    </div>
  );
}
