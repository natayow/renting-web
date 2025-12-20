"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import {
  createPropertySchema,
  CreatePropertyFormData,
  RoomData,
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
  FaCheckCircle,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface PropertyType {
  id: string;
  name: string;
}

interface Facility {
  id: string;
  name: string;
  icon?: string;
}

export default function NewPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
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
      minNights: 1,
      maxNights: 30,
      status: "DRAFT",
      facilityIds: [],
      rooms: [
        {
          name: "",
          description: "",
          maxGuests: 1,
          beds: 1,
          bathrooms: 1,
          basePricePerNightIdr: 0,
        },
      ],
    },
    validationSchema: createPropertySchema,
    onSubmit: async (values) => {
      if (selectedImages.length === 0) {
        toast.error("Please upload at least one image");
        return;
      }

      if (values.facilityIds.length < 3) {
        toast.error("Please select at least 3 facilities");
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
        formData.append("minNights", values.minNights.toString());
        formData.append("maxNights", values.maxNights.toString());
        formData.append("status", values.status);

        formData.append("rooms", JSON.stringify(values.rooms));

        if (values.facilityIds && values.facilityIds.length > 0) {
          formData.append("facilityIds", JSON.stringify(values.facilityIds));
        }

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
          toast.success("Property created successfully!");
          router.push("/");
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
        const [typesRes, facilitiesRes] = await Promise.all([
          axiosInstance.get("/api/property-types"),
          axiosInstance.get("/api/facilities"),
        ]);
        setPropertyTypes(typesRes.data.data || []);
        setFacilities(facilitiesRes.data.data || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Failed to load property types or facilities");
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
      toast.error("You can only upload up to 7 images");
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

  const addRoom = () => {
    const newRoom: RoomData = {
      name: "",
      description: "",
      maxGuests: 1,
      beds: 1,
      bathrooms: 1,
      basePricePerNightIdr: 0,
    };
    formik.setFieldValue("rooms", [...formik.values.rooms, newRoom]);
  };

  const removeRoom = (index: number) => {
    if (formik.values.rooms.length <= 1) {
      toast.error("At least one room is required");
      return;
    }
    const newRooms = formik.values.rooms.filter((_, i) => i !== index);
    formik.setFieldValue("rooms", newRooms);
  };

  const updateRoom = (index: number, field: keyof RoomData, value: any) => {
    const updatedRooms = [...formik.values.rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    formik.setFieldValue("rooms", updatedRooms);
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

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FaBed className="text-[#064749]" />
                Rooms ({formik.values.rooms.length})
              </h2>
              <button
                type="button"
                onClick={addRoom}
                className="flex items-center gap-2 px-4 py-2 bg-[#064749] text-white rounded-xl hover:bg-[#087174] transition-all font-semibold"
              >
                <FaPlus />
                Add Room
              </button>
            </div>

            <div className="space-y-6">
              {formik.values.rooms.map((room, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-xl p-6 relative"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Room {index + 1}
                    </h3>
                    {formik.values.rooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoom(index)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                      >
                        <FaTrash className="text-xs" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room Name *
                      </label>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) =>
                          updateRoom(index, "name", e.target.value)
                        }
                        className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                        placeholder="e.g., Deluxe Ocean View Suite"
                      />
                      {formik.touched.rooms?.[index]?.name &&
                        formik.errors.rooms?.[index] &&
                        typeof formik.errors.rooms[index] === "object" &&
                        "name" in formik.errors.rooms[index] && (
                          <p className="mt-1 text-sm text-red-600">
                            {
                              (
                                formik.errors.rooms[index] as {
                                  name?: string;
                                }
                              ).name
                            }
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room Description
                      </label>
                      <textarea
                        value={room.description || ""}
                        onChange={(e) =>
                          updateRoom(index, "description", e.target.value)
                        }
                        rows={3}
                        className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all"
                        placeholder="Describe this room..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaUsers className="inline mr-2" />
                          Max Guests *
                        </label>
                        <input
                          type="number"
                          value={room.maxGuests}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateRoom(
                              index,
                              "maxGuests",
                              value === "" ? "" : parseInt(value) || 1
                            );
                          }}
                          onBlur={(e) => {
                            if (
                              e.target.value === "" ||
                              parseInt(e.target.value) < 1
                            ) {
                              updateRoom(index, "maxGuests", 1);
                            }
                          }}
                          className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="1"
                          placeholder="Enter number of guests"
                        />
                        {formik.touched.rooms?.[index]?.maxGuests &&
                          formik.errors.rooms?.[index] &&
                          typeof formik.errors.rooms[index] === "object" &&
                          "maxGuests" in formik.errors.rooms[index] && (
                            <p className="mt-1 text-sm text-red-600">
                              {
                                (
                                  formik.errors.rooms[index] as {
                                    maxGuests?: string;
                                  }
                                ).maxGuests
                              }
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
                          value={room.beds}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateRoom(
                              index,
                              "beds",
                              value === "" ? "" : parseInt(value) || 1
                            );
                          }}
                          onBlur={(e) => {
                            if (
                              e.target.value === "" ||
                              parseInt(e.target.value) < 1
                            ) {
                              updateRoom(index, "beds", 1);
                            }
                          }}
                          className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="1"
                          placeholder="Enter number of beds"
                        />
                        {formik.touched.rooms?.[index]?.beds &&
                          formik.errors.rooms?.[index] &&
                          typeof formik.errors.rooms[index] === "object" &&
                          "beds" in formik.errors.rooms[index] && (
                            <p className="mt-1 text-sm text-red-600">
                              {
                                (
                                  formik.errors.rooms[index] as {
                                    beds?: string;
                                  }
                                ).beds
                              }
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
                          value={room.bathrooms}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateRoom(
                              index,
                              "bathrooms",
                              value === "" ? "" : parseInt(value) || 1
                            );
                          }}
                          onBlur={(e) => {
                            if (
                              e.target.value === "" ||
                              parseInt(e.target.value) < 1
                            ) {
                              updateRoom(index, "bathrooms", 1);
                            }
                          }}
                          className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="1"
                          placeholder="Enter number of bathrooms"
                        />
                        {formik.touched.rooms?.[index]?.bathrooms &&
                          formik.errors.rooms?.[index] &&
                          typeof formik.errors.rooms[index] === "object" &&
                          "bathrooms" in formik.errors.rooms[index] && (
                            <p className="mt-1 text-sm text-red-600">
                              {
                                (
                                  formik.errors.rooms[index] as {
                                    bathrooms?: string;
                                  }
                                ).bathrooms
                              }
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaDollarSign className="inline mr-2" />
                          Base Price per Night (IDR) *
                        </label>
                        <input
                          type="number"
                          value={room.basePricePerNightIdr}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateRoom(
                              index,
                              "basePricePerNightIdr",
                              value === "" ? "" : parseInt(value) || 0
                            );
                          }}
                          onBlur={(e) => {
                            if (
                              e.target.value === "" ||
                              parseInt(e.target.value) < 0
                            ) {
                              updateRoom(index, "basePricePerNightIdr", 0);
                            }
                          }}
                          className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064749] focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                          placeholder="e.g., 500000"
                        />
                        {formik.touched.rooms?.[index]?.basePricePerNightIdr &&
                          formik.errors.rooms?.[index] &&
                          typeof formik.errors.rooms[index] === "object" &&
                          "basePricePerNightIdr" in
                            formik.errors.rooms[index] && (
                            <p className="mt-1 text-sm text-red-600">
                              {
                                (
                                  formik.errors.rooms[index] as {
                                    basePricePerNightIdr?: string;
                                  }
                                ).basePricePerNightIdr
                              }
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {formik.touched.rooms &&
                formik.errors.rooms &&
                typeof formik.errors.rooms === "string" && (
                  <p className="text-sm text-red-600">{formik.errors.rooms}</p>
                )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FaCheckCircle className="text-[#064749]" />
              Property Facilities
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Select at least 3 facilities available at your property
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {facilities.map((facility) => {
                const isChecked = formik.values.facilityIds.includes(
                  facility.id
                );
                return (
                  <label
                    key={facility.id}
                    className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      isChecked
                        ? "border-[#064749] bg-[#064749]/5 shadow-sm"
                        : "border-gray-200 hover:border-[#064749]/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const newFacilityIds = e.target.checked
                          ? [...formik.values.facilityIds, facility.id]
                          : formik.values.facilityIds.filter(
                              (id) => id !== facility.id
                            );
                        formik.setFieldValue("facilityIds", newFacilityIds);
                      }}
                      className="w-5 h-5 text-[#064749] border-gray-300 rounded focus:ring-[#064749] focus:ring-2"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700">
                      {facility.name}
                    </span>
                    {isChecked && (
                      <FaCheckCircle className="text-[#064749] absolute top-2 right-2" />
                    )}
                  </label>
                );
              })}
            </div>

            {formik.touched.facilityIds && formik.errors.facilityIds && (
              <p className="mt-3 text-sm text-red-600">
                {formik.errors.facilityIds}
              </p>
            )}

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {formik.values.facilityIds.length}{" "}
                {formik.values.facilityIds.length === 1
                  ? "facility"
                  : "facilities"}
                {formik.values.facilityIds.length < 3 && (
                  <span className="text-red-600 ml-2">
                    (Please select at least 3)
                  </span>
                )}
              </p>
            </div>
          </div>

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

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaDollarSign className="text-[#064749]" />
              Property Status
            </h2>

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
