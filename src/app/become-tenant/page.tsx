"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axiosInstance from "@/utils/axiosInstance";
import { FaBuilding, FaInfoCircle, FaUniversity } from "react-icons/fa";
import { becomeTenantSchema } from "./schemas/becomeTenantSchema";

export default function BecomeTenantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/become-tenant");
    }

    // Redirect if user is already an ADMIN
    if (session?.user?.role?.toUpperCase() === "ADMIN") {
      router.push("/profile");
    }
  }, [status, session, router]);

  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      setSubmitError("");

      const response = await axiosInstance.post(
        "/api/auth/create-admin-profile",
        {
          displayName: values.displayName,
          description: values.description || null,
          bankName: values.bankName || null,
          bankAccountNo: values.bankAccountNo || null,
          bankAccountName: values.bankAccountName || null,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      if (response.data.success) {
        setSubmitSuccess(true);

        // Sign out and redirect to login to get a new session with updated role
        setTimeout(async () => {
          await signOut({
            callbackUrl:
              "/login?message=Role upgraded! Please login again to continue as an Admin.",
            redirect: true,
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error creating admin profile:", error);
      setSubmitError(
        error.response?.data?.message ||
          "Failed to create admin profile. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#064749] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 flex items-center justify-center pt-24 pb-12 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Congratulations!
            </h2>
            <p className="text-gray-600 mb-4">
              You&apos;re now a tenant! Your role has been upgraded to ADMIN.
            </p>
            <p className="text-sm text-gray-500">
              Please log in again to access your admin features...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-[#064749] via-[#087174] to-[#0a9399] px-8 py-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FaBuilding className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Become a Tenant
                </h1>
                <p className="text-blue-100 mt-1">
                  Start earning by renting out your property
                </p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 px-8 py-4">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-blue-500 text-xl mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  What happens next?
                </h3>
                <p className="text-sm text-blue-800">
                  After submitting this form, your account will be upgraded to
                  ADMIN status, allowing you to list properties and manage
                  bookings.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Formik
            initialValues={{
              displayName: "",
              description: "",
              bankName: "",
              bankAccountNo: "",
              bankAccountName: "",
            }}
            validationSchema={becomeTenantSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="px-8 py-8">
                {submitError && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-red-500 shrink-0"
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
                      <p className="text-red-800 text-sm">{submitError}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Profile Information Section */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#064749] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      Profile Information
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="displayName"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Display Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="displayName"
                          type="text"
                          placeholder="e.g., John's Properties"
                          className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-[#064749] outline-none transition-all"
                        />
                        <ErrorMessage
                          name="displayName"
                          component="p"
                          className="mt-1 text-sm text-red-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          This name will be displayed on your property listings
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Description
                        </label>
                        <Field
                          as="textarea"
                          name="description"
                          rows={4}
                          placeholder="Tell us about yourself and your properties..."
                          className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-[#064749] outline-none transition-all resize-none"
                        />
                        <ErrorMessage
                          name="description"
                          component="p"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banking Information Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#064749] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      Banking Information
                    </h2>
                    <p className="text-sm text-gray-600 mb-4 ml-10">
                      Optional - You can add this later in your profile settings
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="bankName"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Bank Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUniversity className="text-gray-400" />
                          </div>
                          <Field
                            name="bankName"
                            type="text"
                            placeholder="e.g., Bank Central Asia"
                            className="w-full text-gray-600 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-[#064749] outline-none transition-all"
                          />
                        </div>
                        <ErrorMessage
                          name="bankName"
                          component="p"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bankAccountNo"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Bank Account Number
                        </label>
                        <Field
                          name="bankAccountNo"
                          type="text"
                          placeholder="e.g., 1234567890"
                          className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-[#064749] outline-none transition-all"
                        />
                        <ErrorMessage
                          name="bankAccountNo"
                          component="p"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bankAccountName"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Bank Account Name
                        </label>
                        <Field
                          name="bankAccountName"
                          type="text"
                          placeholder="e.g., John Doe"
                          className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-[#064749] outline-none transition-all"
                        />
                        <ErrorMessage
                          name="bankAccountName"
                          component="p"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-linear-to-r from-[#064749] to-[#0a9399] text-white rounded-xl hover:from-[#053638] hover:to-[#087174] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Submit Application
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">
            Benefits of becoming a tenant:
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">
                List unlimited properties on our platform
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">
                Manage bookings and availability through our dashboard
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">
                Reach thousands of potential tenants
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">
                Secure payment processing and booking management
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
