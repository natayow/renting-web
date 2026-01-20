"use client";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Page() {
  const { token } = useParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  const onVerifyEmail = async () => {
    try {
      setVerifying(true);
      console.log("=====================================");
      console.log("🔍 Email Verification Process Started");
      console.log("  Token from URL:", token);
      console.log("  Token type:", typeof token);
      console.log("  Token length:", token ? String(token).length : 0);
      console.log("  API endpoint: /api/auth/verify-email");
      console.log(
        "  Full API URL:",
        "http://localhost:8000/api/auth/verify-email"
      );
      console.log("=====================================");

      const response: any = await axiosInstance.get("/api/auth/verify-email", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Verification response:", response);
      console.log("=====================================");

      setSuccess(true);
      toast.success(response?.data?.message || "Email verified successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error("❌ Verification error:", error);
      console.error("  Error response:", error?.response?.data);
      console.error("  Error status:", error?.response?.status);
      console.log("=====================================");
      setSuccess(false);
      toast.error(
        error?.response?.data?.message ||
          "Failed to verify email. The link may have expired."
      );
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (token) {
      onVerifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {verifying ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </>
        ) : success ? (
          <>
            <div className="text-green-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-4">
              Your email has been successfully verified. Redirecting to login...
            </p>
          </>
        ) : (
          <>
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-4">
              We couldn't verify your email. The link may have expired or is
              invalid.
            </p>
            <button
              onClick={() => router.push("/register")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Back to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}
