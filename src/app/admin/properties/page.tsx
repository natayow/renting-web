"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaHome,
  FaBed,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaSearch,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface Room {
  id: string;
  name: string;
  maxGuests: number;
  basePricePerNightIdr: number;
  beds: number;
  bathrooms: number;
}

interface Property {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  type: {
    id: string;
    name: string;
  };
  location: {
    id: string;
    city: string;
    country: string;
    address: string;
  };
  images: { url: string }[];
  rooms: Room[];
  _count?: {
    rooms: number;
  };
}

export default function PropertyManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState<{
    propertyId: string;
    newStatus: "DRAFT" | "ACTIVE" | "INACTIVE";
    propertyTitle: string;
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
    const fetchProperties = async () => {
      if (!session?.user?.accessToken || !session?.user?.id) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/api/properties/admin/${session.user.id}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );

        setProperties(response.data.data);
        setFilteredProperties(response.data.data);
        setError("");
      } catch (err: any) {
        console.error("Error fetching properties:", err);
        setError(err.response?.data?.message || "Failed to load properties");
        toast.error("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "ADMIN") {
      fetchProperties();
    }
  }, [session]);

  useEffect(() => {
    let filtered = properties;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((prop) => prop.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (prop) =>
          prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prop.location.city
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          prop.location.country
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          prop.location.address
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  }, [searchQuery, statusFilter, properties]);

  const handleDelete = async (propertyId: string) => {
    try {
      await axiosInstance.delete(`/api/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });

      setProperties(properties.filter((prop) => prop.id !== propertyId));
      toast.success("Property deleted successfully");
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    } catch (err: any) {
      console.error("Error deleting property:", err);
      toast.error(err.response?.data?.message || "Failed to delete property");
    }
  };

  const handleStatusChange = async (
    propertyId: string,
    newStatus: "DRAFT" | "ACTIVE" | "INACTIVE"
  ) => {
    try {
      await axiosInstance.patch(
        `/api/properties/${propertyId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      setProperties(
        properties.map((prop) =>
          prop.id === propertyId ? { ...prop, status: newStatus } : prop
        )
      );
      toast.success("Property status updated successfully");
      setStatusChangeModalOpen(false);
      setStatusChangeData(null);
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border border-green-300";
      case "INACTIVE":
        return "bg-red-100 text-red-800 border border-red-300";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <FaCheckCircle className="text-green-600" />;
      case "INACTIVE":
        return <FaTimesCircle className="text-red-600" />;
      case "DRAFT":
        return <FaFileAlt className="text-yellow-600" />;
      default:
        return null;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Error</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-purple-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Property Management Dashboard
              </h1>
              <p className="text-gray-600">
                Manage all your properties and rooms in one place
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/properties/new")}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
            >
              <FaPlus />
              Add New Property
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium mb-1">
                    Total Properties
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {properties.length}
                  </p>
                </div>
                <FaHome className="text-purple-500 text-3xl" />
              </div>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">
                    Active
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {properties.filter((p) => p.status === "ACTIVE").length}
                  </p>
                </div>
                <FaCheckCircle className="text-green-500 text-3xl" />
              </div>
            </div>

            <div className="bg-linear-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium mb-1">
                    Draft
                  </p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {properties.filter((p) => p.status === "DRAFT").length}
                  </p>
                </div>
                <FaFileAlt className="text-yellow-500 text-3xl" />
              </div>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Total Rooms
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {properties.reduce(
                      (total, prop) => total + (prop.rooms?.length || 0),
                      0
                    )}
                  </p>
                </div>
                <FaBed className="text-blue-500 text-3xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties by title, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-gray-600 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  statusFilter === "ALL"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  statusFilter === "ACTIVE"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("DRAFT")}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  statusFilter === "DRAFT"
                    ? "bg-yellow-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setStatusFilter("INACTIVE")}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  statusFilter === "INACTIVE"
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaHome className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your filters"
                : "Start by adding your first property"}
            </p>
            {!searchQuery && statusFilter === "ALL" && (
              <button
                onClick={() => router.push("/admin/properties/new")}
                className="px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 font-semibold mx-auto"
              >
                <FaPlus />
                Add Your First Property
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="relative h-48 bg-gray-200">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={`http://localhost:8000/uploads/images/${property.images[0].url}`}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaHome className="text-gray-400 text-6xl" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(
                        property.status
                      )}`}
                    >
                      {getStatusIcon(property.status)}
                      {property.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <FaMapMarkerAlt className="text-sm" />
                        <span className="text-sm">
                          {property.location.city}, {property.location.country}
                        </span>
                      </div>
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {property.type.name}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaBed className="text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {property.rooms?.length || 0} Room Types
                        </span>
                      </div>
                      {property.rooms && property.rooms.length > 0 && (
                        <span className="text-sm text-gray-600">
                          From Rp{" "}
                          {Math.min(
                            ...property.rooms.map((r) => r.basePricePerNightIdr)
                          ).toLocaleString()}
                          /night
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/admin/properties/${property.id}`)
                      }
                      className="flex-1 px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/property/${property.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <FaEye />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setPropertyToDelete(property.id);
                        setDeleteModalOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="mt-3">
                    <select
                      value={property.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as
                          | "DRAFT"
                          | "ACTIVE"
                          | "INACTIVE";
                        setStatusChangeData({
                          propertyId: property.id,
                          newStatus: newStatus,
                          propertyTitle: property.title,
                        });
                        setStatusChangeModalOpen(true);
                      }}
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Delete Property?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete this property? This action
                cannot be undone and will also delete all associated rooms.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPropertyToDelete(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  propertyToDelete && handleDelete(propertyToDelete)
                }
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {statusChangeModalOpen && statusChangeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaEdit className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Update Property Status?
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to change the status of{" "}
                <span className="font-semibold">
                  {statusChangeData.propertyTitle}
                </span>{" "}
                to{" "}
                <span
                  className={`font-semibold ${
                    statusChangeData.newStatus === "ACTIVE"
                      ? "text-green-600"
                      : statusChangeData.newStatus === "INACTIVE"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {statusChangeData.newStatus}
                </span>
                ?
              </p>
              {statusChangeData.newStatus === "ACTIVE" && (
                <p className="text-sm text-gray-500 bg-green-50 p-3 rounded-lg">
                  This property will be visible to users and available for
                  booking.
                </p>
              )}
              {statusChangeData.newStatus === "INACTIVE" && (
                <p className="text-sm text-gray-500 bg-red-50 p-3 rounded-lg">
                  This property will be hidden from users and unavailable for
                  booking.
                </p>
              )}
              {statusChangeData.newStatus === "DRAFT" && (
                <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
                  This property will remain as a draft and not visible to users.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStatusChangeModalOpen(false);
                  setStatusChangeData(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleStatusChange(
                    statusChangeData.propertyId,
                    statusChangeData.newStatus
                  )
                }
                className={`flex-1 px-6 py-3 text-white rounded-xl hover:opacity-90 transition-all font-medium ${
                  statusChangeData.newStatus === "ACTIVE"
                    ? "bg-green-600"
                    : statusChangeData.newStatus === "INACTIVE"
                    ? "bg-red-600"
                    : "bg-yellow-600"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
