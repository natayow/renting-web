"use client";

import { useRouter } from "next/navigation";

import React from "react";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { loginSchema } from "./schemas/loginSchema";
import { Formik, useFormik } from "formik";
import { signIn } from "next-auth/react";

export default function Login() {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const response = await signIn("credentials", {
        email: values?.email,
        password: values?.password,
        redirect: false,
      });
      console.log(response);
      if (response?.ok) {
        toast.success("Login successful!");
        router.push("/");
      }

      toast.error(response?.error);
    },
  });

  const router = useRouter();
  const onHandleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  return (
    <div className="min-h-screen bg-gray-50 mt-8 flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-[#181A18] text-center text-3xl font-extrabold ">
            Log in to your account
          </h2>
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
                  className="input rounded-lg bg-gray-100 input-bordered w-full"
                  required
                />
                {formik?.errors?.password && formik?.touched?.password && (
                  <p id="feedback" className="text-red-500 text-sm mt-1">
                    {formik?.errors?.password}
                  </p>
                )}
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className=" rounded-lg btn bg-[#064749] w-full"
                >
                  Login
                </button>
              </div>
            </form>

            <p className="text-center text-[#181A18] text-sm  mt-4">
              Haven't created an account?{" "}
              <a href="/register" className="link link-primary">
                Create account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
