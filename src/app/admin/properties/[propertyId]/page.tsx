"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import axiosInstance from "@/utils/axiosInstance";
import {
  FaHome,
  FaBed,
  FaBath,
  FaDollarSign,
  FaImage,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaSave,
  FaArrowLeft,
  FaEdit,
  FaCalendarAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as Yup from "yup";

interface PropertyType {
  id: string;
  name: string;
}

interface Facility {
  id: string;
  name: string;
  icon?: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  beds: number;
  bathrooms: number;
  basePricePerNightIdr: number;
  images: { id: string; url: string }[];
}

interface Property {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  city: string;
  country: string;
  address: string;
  type: { id: string; name: string };
  facilities: { facility: { id: string; name: string } }[];
  images: { id: string; url: string }[];
  rooms: Room[];
}

const propertySchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  typeId: Yup.string().required("Property type is required"),
  city: Yup.string().required("City is required"),
  country: Yup.string().required("Country is required"),
  address: Yup.string().required("Address is required"),
  status: Yup.string().oneOf(["DRAFT", "ACTIVE", "INACTIVE"]).required(),
  facilityIds: Yup.array()
    .of(Yup.string())
    .min(1, "Select at least one facility"),
});

export default function EditPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"details" | "rooms">(
    "details"
  );
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);
  const [deleteRoomModalOpen, setDeleteRoomModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

        setProperty(propertyResponse.data.data);
        console.log("Property data:", propertyResponse.data.data);
        console.log("Rooms:", propertyResponse.data.data.rooms);

        const typesResponse = await axiosInstance.get("/api/property-types");
        setPropertyTypes(typesResponse.data.data);

        const facilitiesResponse = await axiosInstance.get("/api/facilities");
        setFacilities(facilitiesResponse.data.data);

        const prop = propertyResponse.data.data;
        formik.setValues({
          title: prop.title || "",
          description: prop.description || "",
          typeId: prop.type?.id || "",
          city: prop.location?.city || "",
          country: prop.location?.country || "",
          address: prop.location?.address || "",
          status: prop.status || "DRAFT",
          facilityIds: prop.facilities?.map((f: any) => f.facility.id) || [],
        });
      } catch (err: any) {
        console.error("Error fetching data:", err);
        toast.error(err.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [session, propertyId]);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      typeId: "",
      city: "",
      country: "",
      address: "",
      status: "DRAFT" as "DRAFT" | "ACTIVE" | "INACTIVE",
      facilityIds: [] as string[],
    },
    validationSchema: propertySchema,
    onSubmit: async (values) => {
      setPendingFormValues(values);
      setUpdateModalOpen(true);
    },
  });

  const handleConfirmUpdate = async () => {
    if (!pendingFormValues) return;

    try {
      setSaving(true);

      await axiosInstance.put(
        `/api/properties/${propertyId}`,
        pendingFormValues,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      toast.success("Property updated successfully");
      setUpdateModalOpen(false);
      setPendingFormValues(null);
      router.push("/admin/properties");
    } catch (err: any) {
      console.error("Error updating property:", err);
      toast.error(err.response?.data?.message || "Failed to update property");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await axiosInstance.delete(`/api/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });

      setProperty((prev) =>
        prev
          ? {
              ...prev,
              rooms: prev.rooms.filter((r) => r.id !== roomId),
            }
          : null
      );

      toast.success("Room deleted successfully");
      setDeleteRoomModalOpen(false);
      setRoomToDelete(null);
    } catch (err: any) {
      console.error("Error deleting room:", err);
      toast.error(err.response?.data?.message || "Failed to delete room");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Property Not Found</p>
            <button
              onClick={() => router.push("/admin/properties")}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-purple-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <button
            onClick={() => router.push("/admin/properties")}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 font-medium"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Property
          </h1>
          <p className="text-gray-600">{property.title}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab("details")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                selectedTab === "details"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Property Details
            </button>
            <button
              onClick={() => setSelectedTab("rooms")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                selectedTab === "rooms"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Rooms ({property.rooms.length})
            </button>
          </div>
        </div>

        {selectedTab === "details" && (
          <form onSubmit={formik.handleSubmit}>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter property title"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.title}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
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
                    placeholder="Enter property description"
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="typeId"
                    value={formik.values.typeId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    {propertyTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.typeId && formik.errors.typeId && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.typeId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                  {formik.touched.city && formik.errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formik.values.country}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter country"
                  />
                  {formik.touched.country && formik.errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.country}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter full address"
                  />
                  {formik.touched.address && formik.errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Facilities
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
                    <span className="text-gray-700 font-medium">
                      {facility.name}
                    </span>
                  </label>
                ))}
              </div>
              {formik.touched.facilityIds && formik.errors.facilityIds && (
                <p className="text-red-500 text-sm mt-2">
                  {formik.errors.facilityIds}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/properties")}
                className="px-6 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {selectedTab === "rooms" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Room Management
              </h2>
              <button
                onClick={() =>
                  router.push(`/admin/properties/${propertyId}/rooms/new`)
                }
                className="px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 font-semibold"
              >
                <FaPlus />
                Add Room
              </button>
            </div>

            {property.rooms.length === 0 ? (
              <div className="text-center py-12">
                <FaBed className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No rooms yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by adding your first room
                </p>
                <button
                  onClick={() =>
                    router.push(`/admin/properties/${propertyId}/rooms/new`)
                  }
                  className="px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 font-semibold mx-auto"
                >
                  <FaPlus />
                  Add First Room
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {property.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="relative h-48 bg-gray-200">
                      {room.images && room.images.length > 0 ? (
                        <img
                          src={`http://localhost:8000/uploads/images/${room.images[0].url}`}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaBed className="text-gray-400 text-6xl" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {room.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {room.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaBed />
                          <span>{room.beds} Beds</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaBath />
                          <span>{room.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaHome />
                          <span>{room.maxGuests} Guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaDollarSign />
                          <span>
                            Rp{" "}
                            {room.basePricePerNightIdr != null
                              ? room.basePricePerNightIdr.toLocaleString()
                              : "Not set"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/properties/${propertyId}/rooms/${room.id}`
                            )
                          }
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <FaEdit />
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/properties/${propertyId}/rooms/${room.id}/peak-season`
                            )
                          }
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 font-medium"
                          title="Manage Peak Season Rates & Availability"
                        >
                          <FaCalendarAlt />
                          Peak Season
                        </button>
                        <button
                          onClick={() => {
                            setRoomToDelete({ id: room.id, name: room.name });
                            setDeleteRoomModalOpen(true);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {updateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaSave className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Update Property?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to save these changes to the property?
                This will update all property details including title,
                description, location, and facilities.
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

      {deleteRoomModalOpen && roomToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Delete Room?
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{roomToDelete.name}</span>? This
                action cannot be undone and will delete all room images and
                booking history.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteRoomModalOpen(false);
                  setRoomToDelete(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  roomToDelete && handleDeleteRoom(roomToDelete.id)
                }
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
