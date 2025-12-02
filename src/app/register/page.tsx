"use client";

import { useFormik } from "formik";
import React, { useState } from "react";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { registerSchema } from "./schemas/registerSchema";
import axiosInstance from "@/utils/axiosInstance";

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: "",
      fullName: "",
      password: "",
      phoneNumber: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setIsLoading(true);
        setSubmitting(true);

        const response = await axiosInstance.post("/api/auth/register", {
          email: values.email,
          fullName: values.fullName,
          password: values.password,
          phoneNumber: values.phoneNumber,
        });

        toast.success("Registration successful! Please login to continue.");

        router.push("/login");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          "Registration failed. Please try again.";
        toast.error(errorMessage);
        console.error("Registration error:", error);
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
    validationSchema: registerSchema,
  });
  return (
    <div className="min-h-screen bg-gray-50 mt-8 flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-[#181A18] text-center text-3xl font-extrabold ">
            Create your account
          </h2>
          <p className="mt-2  text-[#181A18] text-center text-sm ">
            Join us today and get started
          </p>
        </div>

        <div className="card bg-white text-[#181A18] shadow-xl">
          <div className="card-body">
            <div className="space-y-3">
              <button className="btn btn-outline rounded-lg w-full gap-2">
                <FaGoogle className="text-lg" />
                Continue with Google
              </button>
              <button className="btn btn-outline rounded-lg w-full gap-2">
                <FaFacebook className="text-lg" />
                Continue with Facebook
              </button>
              <button className="btn btn-outline rounded-lg w-full gap-2">
                <FaTwitter className="text-lg" />
                Continue with Twitter
              </button>
            </div>

            <div className="divider text-gray-500">OR</div>

            <form onSubmit={formik?.handleSubmit} className="space-y-4">
              <div className="form-control ">
                <label className="label text-[#181A18]">
                  <span className="label-text ">Full Name</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  onChange={formik?.handleChange}
                  value={formik?.values?.fullName}
                  placeholder="Enter your full name"
                  className="input bg-gray-100 input-bordered rounded-lg w-full"
                  required
                />
                {formik?.errors?.fullName && formik?.touched?.fullName && (
                  <p id="feedback" className="text-red-500 text-sm mt-1">
                    {formik?.errors?.fullName}
                  </p>
                )}
              </div>

              <div className="form-control">
                <label className="label text-[#181A18]">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  onChange={formik?.handleChange}
                  value={formik?.values?.email}
                  placeholder="Enter your email"
                  className="input bg-gray-100 rounded-lg input-bordered w-full"
                  required
                />
                {formik?.errors?.email && formik?.touched?.email && (
                  <p id="feedback" className="text-red-500 text-sm mt-1">
                    {formik?.errors?.email}
                  </p>
                )}
              </div>

              <div className="form-control">
                <label className="label text-[#181A18]">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  onChange={formik?.handleChange}
                  value={formik?.values?.password}
                  placeholder="Enter your password"
                  className="input bg-gray-100 rounded-lg input-bordered w-full"
                  required
                />
                {formik?.errors?.password && formik?.touched?.password && (
                  <p id="feedback" className="text-red-500 text-sm mt-1">
                    {formik?.errors?.password}
                  </p>
                )}
              </div>

              <div className="form-control">
                <label className="label text-[#181A18]">
                  <span className="label-text">Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  onChange={formik?.handleChange}
                  value={formik?.values?.phoneNumber}
                  placeholder="Enter your phone number"
                  className="input rounded-lg bg-gray-100 input-bordered w-full"
                  required
                />
                {formik?.errors?.phoneNumber &&
                  formik?.touched?.phoneNumber && (
                    <p id="feedback" className="text-red-500">
                      {formik?.errors?.phoneNumber}
                    </p>
                  )}
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className=" rounded-lg btn bg-[#064749] text-white w-full"
                >
                  Register
                </button>
              </div>
            </form>

            <p className="text-center text-[#181A18] text-sm  mt-4">
              Already have an account?{" "}
              <a href="/login" className="link link-primary">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
