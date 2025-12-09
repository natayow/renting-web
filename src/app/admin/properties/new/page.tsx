"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import {
  createPropertySchema,
  CreatePropertyFormData,
} from "./schemas/propertySchema";
import axiosInstance from "@/utils/axiosInstance";
import {
  FaHome,
  FaUsers,
  FaBed,
  FaBath,
  FaDollarSign,
  FaCalendarAlt,
  FaImage,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface PropertyType {
  id: string;
  name: string;
}

export default function NewPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const formik = useFormik<CreatePropertyFormData>({
    initialValues: {
      title: "",
      description: "",
      typeId: "",
      city: "",
      country: "",
      address: "",
      maxGuests: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      minNights: 1,
      maxNights: 30,
      basePricePerNightIdr: 0,
      status: "DRAFT",
    },
    validationSchema: createPropertySchema,
    onSubmit: async (values) => {
      if (selectedImages.length === 0) {
        alert("Please upload at least one image");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("adminUserId", session?.user?.id || "");
        formData.append("title", values.title);
        if (values.description)
          formData.append("description", values.description);
        formData.append("typeId", values.typeId);
        formData.append("city", values.city);
        formData.append("country", values.country);
        formData.append("address", values.address);
        formData.append("maxGuests", values.maxGuests.toString());
        formData.append("bedrooms", values.bedrooms.toString());
        formData.append("beds", values.beds.toString());
        formData.append("bathrooms", values.bathrooms.toString());
        formData.append("minNights", values.minNights.toString());
        formData.append("maxNights", values.maxNights.toString());
        formData.append(
          "basePricePerNightIdr",
          values.basePricePerNightIdr.toString()
        );
        formData.append("status", values.status);

        selectedImages.forEach((image) => {
          formData.append("propertyImages", image);
        });

        const response = await axiosInstance.post("/api/properties", formData, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          alert("Property created successfully!");
          router.push("/admin/properties");
        }
      } catch (err: any) {
        console.error("Error creating property:", err);
        console.error("Error response:", err.response?.data);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.errors?.map((e: any) => e.msg).join(", ") ||
          "Failed to create property. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/profile");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typesRes = await axiosInstance.get("/api/property-types");
        setPropertyTypes(typesRes.data.data || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Failed to load property types");
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    if (fileArray.length + selectedImages.length > 7) {
      alert("You can only upload up to 7 images");
      return;
    }

    setSelectedImages([...selectedImages, ...fileArray]);

    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#064749] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#064749] hover:text-[#087174] mb-4 font-medium transition-colors"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-linear-to-br from-[#064749] to-[#0a9399] rounded-2xl flex items-center justify-center shadow-lg">
              <FaHome className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Add New Property
              </h1>
              <p className="text-gray-600 mt-1">
                Fill in the details below to list your property
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaHome className="text-[#064749]" />
              Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  placeholder="e.g., Cozy Beachfront Villa"
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={4}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  placeholder="Describe your property..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="typeId"
                    value={formik.values.typeId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  >
                    <option value="">Select a type</option>
                    {propertyTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.typeId && formik.errors.typeId && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.typeId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                    placeholder="e.g., Bali"
                  />
                  {formik.touched.city && formik.errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formik.values.country}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                    placeholder="e.g., Indonesia"
                  />
                  {formik.touched.country && formik.errors.country && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.country}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={2}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  placeholder="e.g., Jl. Sunset Road No. 123"
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaUsers className="text-[#064749]" />
              Property Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUsers className="inline mr-2" />
                  Max Guests *
                </label>
                <input
                  type="number"
                  name="maxGuests"
                  value={formik.values.maxGuests}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  min="1"
                />
                {formik.touched.maxGuests && formik.errors.maxGuests && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.maxGuests}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaBed className="inline mr-2" />
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formik.values.bedrooms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  min="0"
                />
                {formik.touched.bedrooms && formik.errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.bedrooms}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaBed className="inline mr-2" />
                  Beds *
                </label>
                <input
                  type="number"
                  name="beds"
                  value={formik.values.beds}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  min="0"
                />
                {formik.touched.beds && formik.errors.beds && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.beds}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaBath className="inline mr-2" />
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formik.values.bathrooms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  min="0"
                />
                {formik.touched.bathrooms && formik.errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.bathrooms}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaCalendarAlt className="text-[#064749]" />
              Booking Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Nights *
                </label>
                <input
                  type="number"
                  name="minNights"
                  value={formik.values.minNights}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  min="1"
                />
                {formik.touched.minNights && formik.errors.minNights && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.minNights}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Nights *
                </label>
                <input
                  type="number"
                  name="maxNights"
                  value={formik.values.maxNights}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  min="1"
                />
                {formik.touched.maxNights && formik.errors.maxNights && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.maxNights}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaDollarSign className="text-[#064749]" />
              Pricing
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Price per Night (IDR) *
                </label>
                <input
                  type="number"
                  name="basePricePerNightIdr"
                  value={formik.values.basePricePerNightIdr}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                  min="0"
                  placeholder="e.g., 500000"
                />
                {formik.touched.basePricePerNightIdr &&
                  formik.errors.basePricePerNightIdr && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.basePricePerNightIdr}
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaImage className="text-[#064749]" />
              Property Images
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Images (Max 7) *
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                multiple
                onChange={handleImageChange}
                className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-gray-500">
                Accepted formats: JPG, JPEG, PNG, WEBP, SVG. Max 7 images.
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-linear-to-r from-[#064749] to-[#0a9399] text-white rounded-xl hover:from-[#053638] hover:to-[#087174] transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                "Create Property"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
