import React from "react";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";

export default function Login() {
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
            {/* Social Login Buttons */}
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

            {/* Divider */}
            <div className="divider text-gray-500">OR</div>

            {/* Registration Form */}
            <form className="space-y-4">
              <div className="form-control">
                <label className="label text-[#181A18]">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="input bg-gray-100 rounded-lg input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-[#181A18]">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="input rounded-lg bg-gray-100 input-bordered w-full"
                  required
                />
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

            {/* Login Link */}
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
