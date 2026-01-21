"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaUser, FaPhone, FaCamera, FaSave, FaArrowLeft } from "react-icons/fa";
import axiosInstance from "@/utils/axiosInstance";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  pictureUrl?: string;
  role: string;
}

interface EditProfileFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  picture?: File | null;
}

const editProfileSchema = Yup.object().shape({
  fullName: Yup.string()
    .required("Full name is required")
    .max(80, "Full name must be at most 80 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .max(120, "Email must be at most 120 characters"),
  phoneNumber: Yup.string()
    .max(20, "Phone number must be at most 20 characters")
    .nullable(),
});

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

        const userData = response.data.data;
        setProfile(userData);

        // Set preview image if exists
        if (userData.pictureUrl) {
          setPreviewImage(`http://localhost:8000${userData.pictureUrl}`);
        }

        setError("");
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPG, PNG, or WEBP)");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
      setError("");
    }
  };

  const handleSubmit = async (
    values: EditProfileFormData,
    { setSubmitting }: any
  ) => {
    if (!session?.user?.accessToken) return;

    try {
      setError("");
      setSuccess("");

      // Check if email has changed
      const emailChanged = values.email !== profile?.email;

      // First, update profile (name, phone, picture)
      const formData = new FormData();
      formData.append("fullName", values.fullName);

      if (values.phoneNumber) {
        formData.append("phoneNumber", values.phoneNumber);
      }

      // Handle file upload
      if (selectedFile) {
        formData.append("picture", selectedFile);
      }

      const response = await axiosInstance.put(
        "/api/auth/user/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // If email changed, update email separately
      if (emailChanged) {
        try {
          const emailResponse = await axiosInstance.put(
            "/api/auth/user/email",
            { email: values.email },
            {
              headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
              },
            }
          );

          if (emailResponse.data.success) {
            setSuccess(
              "Profile updated successfully! A verification email has been sent to your new email address. Please verify to complete the change."
            );

            // Update session with new data
            await update({
              ...session,
              user: {
                ...session.user,
                fullName: response.data.data.fullName,
                phoneNumber: response.data.data.phoneNumber,
                pictureUrl: response.data.data.pictureUrl,
                email: values.email,
                isVerified: false,
              },
            });

            // Redirect back to profile page after 3 seconds
            setTimeout(() => {
              router.push("/profile");
            }, 3000);
          }
        } catch (emailErr: any) {
          setError(
            emailErr.response?.data?.message ||
              "Failed to update email. Profile changes were saved."
          );
        }
      } else {
        if (response.data.success) {
          setSuccess("Profile updated successfully!");

          // Update session with new data
          await update({
            ...session,
            user: {
              ...session.user,
              fullName: response.data.data.fullName,
              phoneNumber: response.data.data.phoneNumber,
              pictureUrl: response.data.data.pictureUrl,
            },
          });

          // Redirect back to profile page after 1 second
          setTimeout(() => {
            router.push("/profile");
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 text-[#064749] hover:text-[#087174] font-medium transition-colors"
          >
            <FaArrowLeft />
            Back to Profile
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="h-32 bg-linear-to-r from-[#064749] via-[#087174] to-[#0a9399]"></div>

          <div className="px-8 pb-8">
            <div className="flex justify-center -mt-16 mb-6">
              <div className="relative">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-linear-to-br from-[#064749] to-[#0a9399] flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white">
                    {profile && getInitials(profile.fullName)}
                  </div>
                )}
                <label
                  htmlFor="picture"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#064749] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#087174] transition-colors shadow-lg"
                >
                  <FaCamera />
                </label>
                <input
                  type="file"
                  id="picture"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Edit Profile
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Update your personal information
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
                <svg
                  className="w-6 h-6 shrink-0"
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
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-start gap-3">
                <svg
                  className="w-6 h-6 shrink-0"
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
                <p>{success}</p>
              </div>
            )}

            <Formik
              initialValues={{
                fullName: profile?.fullName || "",
                email: profile?.email || "",
                phoneNumber: profile?.phoneNumber || "",
                picture: null,
              }}
              validationSchema={editProfileSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        type="email"
                        name="email"
                        className="w-full text-gray-600 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                        placeholder="Enter your email address"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                    <p className="mt-1 text-sm text-amber-600">
                      ⚠️ If you change your email, you will need to verify the
                      new email address.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        type="text"
                        name="fullName"
                        className="w-full text-gray-600 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaUser />
                      </div>
                    </div>
                    <ErrorMessage
                      name="fullName"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Field
                        type="tel"
                        name="phoneNumber"
                        className="w-full text-gray-600 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaPhone />
                      </div>
                    </div>
                    <ErrorMessage
                      name="phoneNumber"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => router.push("/profile")}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-linear-to-r from-[#064749] to-[#0a9399] text-white rounded-xl hover:from-[#053638] hover:to-[#087174] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
