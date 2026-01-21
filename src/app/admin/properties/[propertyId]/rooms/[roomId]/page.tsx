"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import axiosInstance from "@/utils/axiosInstance";
import {
  FaBed,
  FaBath,
  FaUsers,
  FaDollarSign,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as Yup from "yup";

interface Facility {
  id: string;
  name: string;
  icon?: string;
}

const roomSchema = Yup.object().shape({
  name: Yup.string().required("Room name is required"),
  description: Yup.string().required("Description is required"),
  maxGuests: Yup.number()
    .min(1, "Minimum 1 guest")
    .required("Max guests is required"),
  beds: Yup.number()
    .min(1, "Minimum 1 bed")
    .required("Number of beds is required"),
  bathrooms: Yup.number()
    .min(1, "Minimum 1 bathroom")
    .required("Number of bathrooms is required"),
  basePricePerNightIdr: Yup.number()
    .min(0, "Price must be positive")
    .required("Price is required"),
  facilityIds: Yup.array().of(Yup.string()),
});

export default function EditRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.propertyId as string;
  const roomId = params.roomId as string;

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [propertyTitle, setPropertyTitle] = useState("");
  const [roomName, setRoomName] = useState("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "ADMIN") {
      toast.error("Access denied. Admin only.");
      router.push("/profile");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) return;

      try {
        setLoading(true);

        const propertyResponse = await axiosInstance.get(
          `/api/properties/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );
        setPropertyTitle(propertyResponse.data.data.title);

        const facilitiesResponse = await axiosInstance.get("/api/facilities");
        setFacilities(facilitiesResponse.data.data);

        const roomResponse = await axiosInstance.get(`/api/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });

        const room = roomResponse.data.data;
        setRoomName(room.name);

        formik.setValues({
          name: room.name,
          description: room.description,
          maxGuests: room.maxGuests || room.capacity || 1,
          beds: room.beds || room.totalBeds || 1,
          bathrooms: room.bathrooms || room.totalBathrooms || 1,
          basePricePerNightIdr: room.basePricePerNightIdr || room.price || 0,
          facilityIds:
            room.facilities?.map(
              (f: any) => f.facility?.id || f.facilityId || f.id
            ) || [],
        });
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [session, propertyId, roomId]);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      maxGuests: 1,
      beds: 1,
      bathrooms: 1,
      basePricePerNightIdr: 0,
      facilityIds: [] as string[],
    },
    validationSchema: roomSchema,
    onSubmit: async (values) => {
      setPendingFormValues(values);
      setUpdateModalOpen(true);
    },
  });

  const handleConfirmUpdate = async () => {
    if (!pendingFormValues) return;

    try {
      setSaving(true);

      await axiosInstance.put(`/api/rooms/${roomId}`, pendingFormValues, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });

      toast.success("Room updated successfully");
      setUpdateModalOpen(false);
      setPendingFormValues(null);
      router.push(`/admin/properties/${propertyId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update room");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-purple-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <button
            onClick={() => router.push(`/admin/properties/${propertyId}`)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 font-medium"
          >
            <FaArrowLeft />
            Back to Property
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Room</h1>
          <p className="text-gray-600">
            {propertyTitle} - {roomName}
          </p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Room Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Deluxe King Room"
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={4}
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe the room features and amenities..."
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-purple-600" />
                      Max Guests *
                    </div>
                  </label>
                  <input
                    type="number"
                    name="maxGuests"
                    value={formik.values.maxGuests}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min="1"
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {formik.touched.maxGuests && formik.errors.maxGuests && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.maxGuests}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaBed className="text-purple-600" />
                      Beds *
                    </div>
                  </label>
                  <input
                    type="number"
                    name="beds"
                    value={formik.values.beds}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min="1"
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {formik.touched.beds && formik.errors.beds && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.beds}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaBath className="text-purple-600" />
                      Bathrooms *
                    </div>
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formik.values.bathrooms}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min="1"
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {formik.touched.bathrooms && formik.errors.bathrooms && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.bathrooms}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="text-purple-600" />
                      Price/Night *
                    </div>
                  </label>
                  <input
                    type="number"
                    name="basePricePerNightIdr"
                    value={formik.values.basePricePerNightIdr}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min="0"
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="IDR"
                  />
                  {formik.touched.basePricePerNightIdr &&
                    formik.errors.basePricePerNightIdr && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.basePricePerNightIdr}
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Room Facilities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {facilities.map((facility) => (
                <label
                  key={facility.id}
                  className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={formik.values.facilityIds.includes(facility.id)}
                    onChange={(e) => {
                      const newFacilities = e.target.checked
                        ? [...formik.values.facilityIds, facility.id]
                        : formik.values.facilityIds.filter(
                            (id) => id !== facility.id
                          );
                      formik.setFieldValue("facilityIds", newFacilities);
                    }}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700 font-medium text-sm">
                    {facility.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave />
              {saving ? "Updating..." : "Update Room"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/properties/${propertyId}`)}
              className="px-6 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {updateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaSave className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Update Room?
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to save these changes to{" "}
                <span className="font-semibold">{roomName}</span>? This will
                update all room details including pricing, capacity, and
                facilities.
              </p>
              <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
                <strong>Note:</strong> Existing bookings will not be affected by
                these changes.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUpdateModalOpen(false);
                  setPendingFormValues(null);
                }}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdate}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Confirm Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
