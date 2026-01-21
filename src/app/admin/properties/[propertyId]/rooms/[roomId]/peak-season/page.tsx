"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "@/utils/axiosInstance";
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaDollarSign,
  FaPercent,
  FaSave,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface PeakSeasonRate {
  id: string;
  startDate: string;
  endDate: string;
  adjustmentType: "FIXED" | "PERCENTAGE";
  adjustmentValue: number;
  note?: string;
  isActive: boolean;
}

interface Room {
  id: string;
  name: string;
  basePricePerNightIdr: number;
  property: {
    id: string;
    title: string;
  };
}

interface RoomAvailability {
  id: string;
  date: string;
  isAvailable: boolean;
}

const peakSeasonSchema = Yup.object().shape({
  selectedDate: Yup.date()
    .required("Date is required")
    .typeError("Invalid date format"),
  adjustmentType: Yup.string()
    .oneOf(["FIXED", "PERCENTAGE"], "Invalid adjustment type")
    .required("Adjustment type is required"),
  adjustmentValue: Yup.number()
    .required("Adjustment value is required")
    .when("adjustmentType", {
      is: "PERCENTAGE",
      then: (schema) =>
        schema
          .min(0, "Percentage must be at least 0")
          .max(1000, "Percentage cannot exceed 1000"),
      otherwise: (schema) => schema.min(0, "Amount must be positive"),
    }),
  note: Yup.string().max(200, "Note cannot exceed 200 characters"),
});

const bulkPeakSeasonSchema = Yup.object().shape({
  startDate: Yup.date()
    .required("Start date is required")
    .typeError("Invalid date format"),
  endDate: Yup.date()
    .required("End date is required")
    .typeError("Invalid date format")
    .min(Yup.ref("startDate"), "End date must be after or equal to start date"),
  adjustmentType: Yup.string()
    .oneOf(["FIXED", "PERCENTAGE"], "Invalid adjustment type")
    .required("Adjustment type is required"),
  adjustmentValue: Yup.number()
    .required("Adjustment value is required")
    .when("adjustmentType", {
      is: "PERCENTAGE",
      then: (schema) =>
        schema
          .min(0, "Percentage must be at least 0")
          .max(1000, "Percentage cannot exceed 1000"),
      otherwise: (schema) => schema.min(0, "Amount must be positive"),
    }),
  note: Yup.string().max(200, "Note cannot exceed 200 characters"),
});

const availabilitySchema = Yup.object().shape({
  startDate: Yup.date()
    .required("Start date is required")
    .typeError("Invalid date format"),
  endDate: Yup.date()
    .required("End date is required")
    .typeError("Invalid date format")
    .min(Yup.ref("startDate"), "End date must be after or equal to start date"),
  isAvailable: Yup.boolean().required(),
});

export default function PeakSeasonManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.propertyId as string;
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [peakSeasonRates, setPeakSeasonRates] = useState<PeakSeasonRate[]>([]);
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingRate, setEditingRate] = useState<PeakSeasonRate | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "peak-season" | "availability"
  >("peak-season");

  const [confirmAddModal, setConfirmAddModal] = useState(false);
  const [confirmEditModal, setConfirmEditModal] = useState(false);
  const [confirmBulkModal, setConfirmBulkModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [confirmToggleModal, setConfirmToggleModal] = useState(false);
  const [confirmAvailabilityModal, setConfirmAvailabilityModal] =
    useState(false);
  const [rateToDelete, setRateToDelete] = useState<PeakSeasonRate | null>(null);
  const [rateToToggle, setRateToToggle] = useState<PeakSeasonRate | null>(null);

  const peakSeasonFormik = useFormik({
    initialValues: {
      selectedDate: null as Date | null,
      adjustmentType: "PERCENTAGE" as "FIXED" | "PERCENTAGE",
      adjustmentValue: "",
      note: "",
    },
    validationSchema: peakSeasonSchema,
    onSubmit: async (values) => {
      if (editingRate) {
        setConfirmEditModal(true);
      } else {
        setConfirmAddModal(true);
      }
    },
  });

  const bulkPeakSeasonFormik = useFormik({
    initialValues: {
      startDate: null as Date | null,
      endDate: null as Date | null,
      adjustmentType: "PERCENTAGE" as "FIXED" | "PERCENTAGE",
      adjustmentValue: "",
      note: "",
    },
    validationSchema: bulkPeakSeasonSchema,
    onSubmit: async (values) => {
      setConfirmBulkModal(true);
    },
  });

  const availabilityFormik = useFormik({
    initialValues: {
      startDate: null as Date | null,
      endDate: null as Date | null,
      isAvailable: true,
    },
    validationSchema: availabilitySchema,
    onSubmit: async (values) => {
      setConfirmAvailabilityModal(true);
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "ADMIN") {
      toast.error("Access denied. Admin only.");
      router.push("/profile");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchData();
    }
  }, [session, roomId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const roomResponse = await axiosInstance.get(`/api/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });
      setRoom(roomResponse.data.data);

      const ratesResponse = await axiosInstance.get(
        `/api/rooms/${roomId}/peak-season?includeInactive=true`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
      setPeakSeasonRates(ratesResponse.data.data);

      const now = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(now.getMonth() + 3);

      const availabilityResponse = await axiosInstance.get(
        `/api/rooms/${roomId}/availability?startDate=${now.toISOString()}&endDate=${threeMonthsLater.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
      setAvailability(availabilityResponse.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePeakSeason = (rate: PeakSeasonRate) => {
    setRateToDelete(rate);
    setConfirmDeleteModal(true);
  };

  const confirmDeletePeakSeason = async () => {
    if (!rateToDelete) return;

    try {
      await axiosInstance.delete(`/api/rooms/peak-season/${rateToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });

      toast.success("Peak season rate deleted successfully");
      setConfirmDeleteModal(false);
      setRateToDelete(null);
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete peak season rate"
      );
    }
  };

  const handleToggleActive = (rate: PeakSeasonRate) => {
    setRateToToggle(rate);
    setConfirmToggleModal(true);
  };

  const confirmToggleActive = async () => {
    if (!rateToToggle) return;

    try {
      await axiosInstance.put(
        `/api/rooms/peak-season/${rateToToggle.id}`,
        {
          isActive: !rateToToggle.isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      toast.success(
        `Peak season rate ${
          !rateToToggle.isActive ? "activated" : "deactivated"
        }`
      );
      setConfirmToggleModal(false);
      setRateToToggle(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const confirmAddPeakSeason = async () => {
    try {
      const values = peakSeasonFormik.values;
      if (!values.selectedDate) {
        toast.error("Please select a date");
        return;
      }

      await axiosInstance.post(
        `/api/rooms/${roomId}/peak-season`,
        {
          startDate: values.selectedDate.toISOString(),
          endDate: values.selectedDate.toISOString(),
          adjustmentType: values.adjustmentType,
          adjustmentValue: Number(values.adjustmentValue),
          note: values.note,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
      toast.success("Peak season rate added successfully");
      setShowAddModal(false);
      setConfirmAddModal(false);
      peakSeasonFormik.resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to add peak season rate"
      );
    }
  };

  const confirmEditPeakSeason = async () => {
    if (!editingRate) return;

    try {
      const values = peakSeasonFormik.values;
      if (!values.selectedDate) {
        toast.error("Please select a date");
        return;
      }

      await axiosInstance.put(
        `/api/rooms/peak-season/${editingRate.id}`,
        {
          startDate: values.selectedDate.toISOString(),
          endDate: values.selectedDate.toISOString(),
          adjustmentType: values.adjustmentType,
          adjustmentValue: Number(values.adjustmentValue),
          note: values.note,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
      toast.success("Peak season rate updated successfully");
      setEditingRate(null);
      setConfirmEditModal(false);
      peakSeasonFormik.resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update peak season rate"
      );
    }
  };

  const confirmBulkAddPeakSeason = async () => {
    try {
      const values = bulkPeakSeasonFormik.values;

      if (!values.startDate || !values.endDate) {
        toast.error("Please select both start and end dates");
        return;
      }

      await axiosInstance.post(
        `/api/rooms/${roomId}/peak-season`,
        {
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          adjustmentType: values.adjustmentType,
          adjustmentValue: Number(values.adjustmentValue),
          note: values.note,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      toast.success("Peak season rate added successfully");
      setShowBulkModal(false);
      setConfirmBulkModal(false);
      bulkPeakSeasonFormik.resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to add peak season rate"
      );
    }
  };

  const confirmUpdateAvailability = async () => {
    try {
      const values = availabilityFormik.values;

      if (!values.startDate || !values.endDate) {
        toast.error("Please select both start and end dates");
        return;
      }

      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      const dates = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push({
          date: new Date(d).toISOString(),
          isAvailable: values.isAvailable,
        });
      }

      await axiosInstance.post(
        `/api/rooms/${roomId}/availability/bulk`,
        { dates },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      toast.success("Room availability updated successfully");
      setConfirmAvailabilityModal(false);
      availabilityFormik.resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update availability"
      );
    }
  };

  const openEditModal = (rate: PeakSeasonRate) => {
    setEditingRate(rate);
    peakSeasonFormik.setValues({
      selectedDate: new Date(rate.startDate),
      adjustmentType: rate.adjustmentType,
      adjustmentValue: rate.adjustmentValue.toString(),
      note: rate.note || "",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateAdjustedPrice = (basePrice: number, rate: PeakSeasonRate) => {
    if (rate.adjustmentType === "FIXED") {
      return basePrice + rate.adjustmentValue;
    } else {
      return basePrice + (basePrice * rate.adjustmentValue) / 100;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <p className="text-red-500 text-xl font-semibold">Room not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-purple-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <button
            onClick={() =>
              router.push(`/admin/properties/${propertyId}/rooms/${roomId}`)
            }
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 font-medium"
          >
            <FaArrowLeft />
            Back to Room
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Peak Season & Availability Management
          </h1>
          <p className="text-gray-600">{room.name}</p>
          <p className="text-sm text-gray-500">{room.property.title}</p>
          <div className="mt-4 inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold">
            Base Price: {formatCurrency(room.basePricePerNightIdr)}/night
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab("peak-season")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                selectedTab === "peak-season"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaDollarSign className="inline mr-2" />
              Peak Season Rates ({peakSeasonRates.length})
            </button>
            <button
              onClick={() => setSelectedTab("availability")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                selectedTab === "availability"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaCalendar className="inline mr-2" />
              Room Availability
            </button>
          </div>
        </div>

        {/* Peak Season Tab */}
        {selectedTab === "peak-season" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Peak Season Rates
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    <FaPlus />
                    Bulk Add
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2"
                  >
                    <FaPlus />
                    Add Peak Season
                  </button>
                </div>
              </div>

              {peakSeasonRates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaCalendar className="mx-auto text-6xl mb-4 opacity-20" />
                  <p>No peak season rates defined yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {peakSeasonRates.map((rate) => (
                    <div
                      key={rate.id}
                      className={`border rounded-xl p-6 ${
                        rate.isActive
                          ? "border-purple-300 bg-purple-50"
                          : "border-gray-300 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                rate.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-300 text-gray-700"
                              }`}
                            >
                              {rate.isActive ? "Active" : "Inactive"}
                            </span>
                            <span className="text-gray-600">
                              {new Date(rate.startDate).toLocaleDateString()} -{" "}
                              {new Date(rate.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Adjustment Type
                              </p>
                              <p className="font-semibold text-gray-900 flex items-center gap-2">
                                {rate.adjustmentType === "FIXED" ? (
                                  <>
                                    <FaDollarSign /> Fixed Amount
                                  </>
                                ) : (
                                  <>
                                    <FaPercent /> Percentage
                                  </>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Adjustment Value
                              </p>
                              <p className="font-semibold text-gray-900">
                                {rate.adjustmentType === "FIXED"
                                  ? formatCurrency(rate.adjustmentValue)
                                  : `${rate.adjustmentValue}%`}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Adjusted Price
                              </p>
                              <p className="font-semibold text-purple-600">
                                {formatCurrency(
                                  calculateAdjustedPrice(
                                    room.basePricePerNightIdr,
                                    rate
                                  )
                                )}
                                /night
                              </p>
                            </div>
                          </div>
                          {rate.note && (
                            <p className="mt-3 text-sm text-gray-600 italic">
                              Note: {rate.note}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleToggleActive(rate)}
                            className={`p-2 rounded-lg transition-all ${
                              rate.isActive
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                            title={rate.isActive ? "Deactivate" : "Activate"}
                          >
                            {rate.isActive ? <FaTimes /> : <FaCheck />}
                          </button>
                          <button
                            onClick={() => openEditModal(rate)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeletePeakSeason(rate)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
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
          </div>
        )}

        {/* Availability Tab */}
        {selectedTab === "availability" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Manage Room Availability
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Update Availability for Date Range
                </h3>
                <form onSubmit={availabilityFormik.handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <DatePicker
                        selected={availabilityFormik.values.startDate}
                        onChange={(date) =>
                          availabilityFormik.setFieldValue("startDate", date)
                        }
                        onBlur={() =>
                          availabilityFormik.setFieldTouched("startDate", true)
                        }
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select start date"
                        className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        wrapperClassName="w-full"
                      />
                      {availabilityFormik.touched.startDate &&
                        availabilityFormik.errors.startDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {availabilityFormik.errors.startDate}
                          </p>
                        )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <DatePicker
                        selected={availabilityFormik.values.endDate}
                        onChange={(date) =>
                          availabilityFormik.setFieldValue("endDate", date)
                        }
                        onBlur={() =>
                          availabilityFormik.setFieldTouched("endDate", true)
                        }
                        minDate={
                          availabilityFormik.values.startDate || new Date()
                        }
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select end date"
                        disabled={!availabilityFormik.values.startDate}
                        className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                        wrapperClassName="w-full"
                      />
                      {availabilityFormik.touched.endDate &&
                        availabilityFormik.errors.endDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {availabilityFormik.errors.endDate}
                          </p>
                        )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="isAvailable"
                        value={
                          availabilityFormik.values.isAvailable
                            ? "available"
                            : "unavailable"
                        }
                        onChange={(e) =>
                          availabilityFormik.setFieldValue(
                            "isAvailable",
                            e.target.value === "available"
                          )
                        }
                        className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={availabilityFormik.isSubmitting}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaSave />
                    {availabilityFormik.isSubmitting
                      ? "Updating..."
                      : "Update Availability"}
                  </button>
                </form>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Current Availability (Next 3 Months)
                </h3>
                {availability.length === 0 ? (
                  <p className="text-gray-500">
                    No specific availability rules set. Room is available by
                    default.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availability.map((avail) => (
                      <div
                        key={avail.id}
                        className={`p-4 rounded-lg border ${
                          avail.isAvailable
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                        }`}
                      >
                        <p className="font-medium text-gray-900">
                          {new Date(avail.date).toLocaleDateString()}
                        </p>
                        <p
                          className={`text-sm ${
                            avail.isAvailable
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {avail.isAvailable ? "Available" : "Unavailable"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Peak Season Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Add Peak Season Rate
              </h3>
              <form onSubmit={peakSeasonFormik.handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date *
                    </label>
                    <DatePicker
                      selected={peakSeasonFormik.values.selectedDate}
                      onChange={(date) =>
                        peakSeasonFormik.setFieldValue("selectedDate", date)
                      }
                      onBlur={() =>
                        peakSeasonFormik.setFieldTouched("selectedDate", true)
                      }
                      minDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select date"
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      wrapperClassName="w-full"
                    />
                    {peakSeasonFormik.touched.selectedDate &&
                      peakSeasonFormik.errors.selectedDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {peakSeasonFormik.errors.selectedDate}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjustment Type *
                    </label>
                    <select
                      name="adjustmentType"
                      value={peakSeasonFormik.values.adjustmentType}
                      onChange={peakSeasonFormik.handleChange}
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="PERCENTAGE">Percentage Increase</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjustment Value * (
                      {peakSeasonFormik.values.adjustmentType === "FIXED"
                        ? "IDR"
                        : "%"}
                      )
                    </label>
                    <input
                      type="number"
                      name="adjustmentValue"
                      value={peakSeasonFormik.values.adjustmentValue}
                      onChange={peakSeasonFormik.handleChange}
                      onBlur={peakSeasonFormik.handleBlur}
                      placeholder={
                        peakSeasonFormik.values.adjustmentType === "FIXED"
                          ? "Enter amount in IDR"
                          : "Enter percentage (e.g., 25 for 25%)"
                      }
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {peakSeasonFormik.touched.adjustmentValue &&
                      peakSeasonFormik.errors.adjustmentValue && (
                        <p className="text-red-500 text-sm mt-1">
                          {peakSeasonFormik.errors.adjustmentValue}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (Optional)
                    </label>
                    <textarea
                      name="note"
                      value={peakSeasonFormik.values.note}
                      onChange={peakSeasonFormik.handleChange}
                      onBlur={peakSeasonFormik.handleBlur}
                      placeholder="e.g., Christmas Holiday, New Year, etc."
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                    {peakSeasonFormik.touched.note &&
                      peakSeasonFormik.errors.note && (
                        <p className="text-red-500 text-sm mt-1">
                          {peakSeasonFormik.errors.note}
                        </p>
                      )}
                  </div>
                  {peakSeasonFormik.values.adjustmentValue && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-1">
                        Preview: Adjusted price will be
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(
                          peakSeasonFormik.values.adjustmentType === "FIXED"
                            ? room.basePricePerNightIdr +
                                Number(peakSeasonFormik.values.adjustmentValue)
                            : room.basePricePerNightIdr +
                                (room.basePricePerNightIdr *
                                  Number(
                                    peakSeasonFormik.values.adjustmentValue
                                  )) /
                                  100
                        )}
                        /night
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      peakSeasonFormik.resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={peakSeasonFormik.isSubmitting}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus />
                    {peakSeasonFormik.isSubmitting
                      ? "Adding..."
                      : "Add Peak Season"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Peak Season Modal */}
        {editingRate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Edit Peak Season Rate
              </h3>
              <form onSubmit={peakSeasonFormik.handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date *
                    </label>
                    <DatePicker
                      selected={peakSeasonFormik.values.selectedDate}
                      onChange={(date) =>
                        peakSeasonFormik.setFieldValue("selectedDate", date)
                      }
                      onBlur={() =>
                        peakSeasonFormik.setFieldTouched("selectedDate", true)
                      }
                      minDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select date"
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      wrapperClassName="w-full"
                    />
                    {peakSeasonFormik.touched.selectedDate &&
                      peakSeasonFormik.errors.selectedDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {peakSeasonFormik.errors.selectedDate}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjustment Type *
                    </label>
                    <select
                      name="adjustmentType"
                      value={peakSeasonFormik.values.adjustmentType}
                      onChange={peakSeasonFormik.handleChange}
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="PERCENTAGE">Percentage Increase</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjustment Value * (
                      {peakSeasonFormik.values.adjustmentType === "FIXED"
                        ? "IDR"
                        : "%"}
                      )
                    </label>
                    <input
                      type="number"
                      name="adjustmentValue"
                      value={peakSeasonFormik.values.adjustmentValue}
                      onChange={peakSeasonFormik.handleChange}
                      onBlur={peakSeasonFormik.handleBlur}
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {peakSeasonFormik.touched.adjustmentValue &&
                      peakSeasonFormik.errors.adjustmentValue && (
                        <p className="text-red-500 text-sm mt-1">
                          {peakSeasonFormik.errors.adjustmentValue}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (Optional)
                    </label>
                    <textarea
                      name="note"
                      value={peakSeasonFormik.values.note}
                      onChange={peakSeasonFormik.handleChange}
                      onBlur={peakSeasonFormik.handleBlur}
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                    {peakSeasonFormik.touched.note &&
                      peakSeasonFormik.errors.note && (
                        <p className="text-red-500 text-sm mt-1">
                          {peakSeasonFormik.errors.note}
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRate(null);
                      peakSeasonFormik.resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={peakSeasonFormik.isSubmitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaSave />
                    {peakSeasonFormik.isSubmitting
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Bulk Add Peak Season Rates
              </h3>
              <form
                onSubmit={bulkPeakSeasonFormik.handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <DatePicker
                      selected={bulkPeakSeasonFormik.values.startDate}
                      onChange={(date) =>
                        bulkPeakSeasonFormik.setFieldValue("startDate", date)
                      }
                      onBlur={() =>
                        bulkPeakSeasonFormik.setFieldTouched("startDate", true)
                      }
                      minDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select start date"
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      wrapperClassName="w-full"
                    />
                    {bulkPeakSeasonFormik.touched.startDate &&
                      bulkPeakSeasonFormik.errors.startDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {bulkPeakSeasonFormik.errors.startDate}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <DatePicker
                      selected={bulkPeakSeasonFormik.values.endDate}
                      onChange={(date) =>
                        bulkPeakSeasonFormik.setFieldValue("endDate", date)
                      }
                      onBlur={() =>
                        bulkPeakSeasonFormik.setFieldTouched("endDate", true)
                      }
                      minDate={
                        bulkPeakSeasonFormik.values.startDate || new Date()
                      }
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select end date"
                      disabled={!bulkPeakSeasonFormik.values.startDate}
                      className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                      wrapperClassName="w-full"
                    />
                    {bulkPeakSeasonFormik.touched.endDate &&
                      bulkPeakSeasonFormik.errors.endDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {bulkPeakSeasonFormik.errors.endDate}
                        </p>
                      )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select a date range to apply peak season rates for all dates
                  within that range.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Type *
                  </label>
                  <select
                    name="adjustmentType"
                    value={bulkPeakSeasonFormik.values.adjustmentType}
                    onChange={bulkPeakSeasonFormik.handleChange}
                    onBlur={bulkPeakSeasonFormik.handleBlur}
                    className={`w-full text-gray-600 px-4 py-2 border ${
                      bulkPeakSeasonFormik.touched.adjustmentType &&
                      bulkPeakSeasonFormik.errors.adjustmentType
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500`}
                  >
                    <option value="PERCENTAGE">Percentage Increase</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                  {bulkPeakSeasonFormik.touched.adjustmentType &&
                    bulkPeakSeasonFormik.errors.adjustmentType && (
                      <p className="text-red-500 text-sm mt-1">
                        {bulkPeakSeasonFormik.errors.adjustmentType}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Value * (
                    {bulkPeakSeasonFormik.values.adjustmentType === "FIXED"
                      ? "IDR"
                      : "%"}
                    )
                  </label>
                  <input
                    type="number"
                    name="adjustmentValue"
                    value={bulkPeakSeasonFormik.values.adjustmentValue}
                    onChange={bulkPeakSeasonFormik.handleChange}
                    onBlur={bulkPeakSeasonFormik.handleBlur}
                    className={`w-full text-gray-600 px-4 py-2 border ${
                      bulkPeakSeasonFormik.touched.adjustmentValue &&
                      bulkPeakSeasonFormik.errors.adjustmentValue
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500`}
                  />
                  {bulkPeakSeasonFormik.touched.adjustmentValue &&
                    bulkPeakSeasonFormik.errors.adjustmentValue && (
                      <p className="text-red-500 text-sm mt-1">
                        {bulkPeakSeasonFormik.errors.adjustmentValue}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (Optional)
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={bulkPeakSeasonFormik.values.note}
                    onChange={bulkPeakSeasonFormik.handleChange}
                    onBlur={bulkPeakSeasonFormik.handleBlur}
                    placeholder="e.g., Holiday Season"
                    className="w-full text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {bulkPeakSeasonFormik.values.startDate &&
                    bulkPeakSeasonFormik.values.endDate ? (
                      <>
                        <strong>
                          {Math.ceil(
                            (bulkPeakSeasonFormik.values.endDate.getTime() -
                              bulkPeakSeasonFormik.values.startDate.getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1}
                        </strong>{" "}
                        date(s) will be added
                      </>
                    ) : (
                      "Select a date range to see the number of dates"
                    )}
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkModal(false);
                      bulkPeakSeasonFormik.resetForm();
                    }}
                    disabled={bulkPeakSeasonFormik.isSubmitting}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkPeakSeasonFormik.isSubmitting}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkPeakSeasonFormik.isSubmitting ? (
                      "Adding..."
                    ) : (
                      <>
                        <FaPlus />
                        Add Bulk Rates
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal - Add Peak Season */}
        {confirmAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaPlus className="text-purple-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Add Peak Season Rate?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to add this peak season rate for{" "}
                  <span className="font-semibold">
                    {peakSeasonFormik.values.selectedDate?.toLocaleDateString(
                      "en-GB"
                    )}
                  </span>
                  ?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAddModal(false)}
                  disabled={peakSeasonFormik.isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddPeakSeason}
                  disabled={peakSeasonFormik.isSubmitting}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {peakSeasonFormik.isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Confirm Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal - Edit Peak Season */}
        {confirmEditModal && editingRate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaEdit className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Update Peak Season Rate?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to save these changes to the peak season
                  rate?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmEditModal(false)}
                  disabled={peakSeasonFormik.isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEditPeakSeason}
                  disabled={peakSeasonFormik.isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {peakSeasonFormik.isSubmitting ? (
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

        {/* Confirmation Modal - Bulk Add Peak Season */}
        {confirmBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaPlus className="text-indigo-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Add Bulk Peak Season Rates?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to add peak season rates from{" "}
                  <span className="font-semibold">
                    {bulkPeakSeasonFormik.values.startDate?.toLocaleDateString(
                      "en-GB"
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {bulkPeakSeasonFormik.values.endDate?.toLocaleDateString(
                      "en-GB"
                    )}
                  </span>
                  ?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmBulkModal(false)}
                  disabled={bulkPeakSeasonFormik.isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkAddPeakSeason}
                  disabled={bulkPeakSeasonFormik.isSubmitting}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bulkPeakSeasonFormik.isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Confirm Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal - Delete Peak Season */}
        {confirmDeleteModal && rateToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaTrash className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Delete Peak Season Rate?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to delete the peak season rate from{" "}
                  <span className="font-semibold">
                    {new Date(rateToDelete.startDate).toLocaleDateString()}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {new Date(rateToDelete.endDate).toLocaleDateString()}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setConfirmDeleteModal(false);
                    setRateToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePeakSeason}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <FaTrash />
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal - Toggle Active Status */}
        {confirmToggleModal && rateToToggle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 ${
                    rateToToggle.isActive ? "bg-yellow-100" : "bg-green-100"
                  } rounded-full mx-auto mb-4 flex items-center justify-center`}
                >
                  {rateToToggle.isActive ? (
                    <FaTimes className="text-yellow-600 text-2xl" />
                  ) : (
                    <FaCheck className="text-green-600 text-2xl" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {rateToToggle.isActive ? "Deactivate" : "Activate"} Peak
                  Season Rate?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to{" "}
                  {rateToToggle.isActive ? "deactivate" : "activate"} this peak
                  season rate?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setConfirmToggleModal(false);
                    setRateToToggle(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleActive}
                  className={`flex-1 px-6 py-3 ${
                    rateToToggle.isActive
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2`}
                >
                  {rateToToggle.isActive ? <FaTimes /> : <FaCheck />}
                  Confirm {rateToToggle.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal - Update Availability */}
        {confirmAvailabilityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaCalendar className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Update Room Availability?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to update availability from{" "}
                  <span className="font-semibold">
                    {availabilityFormik.values.startDate?.toLocaleDateString(
                      "en-GB"
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {availabilityFormik.values.endDate?.toLocaleDateString(
                      "en-GB"
                    )}
                  </span>{" "}
                  as{" "}
                  <span className="font-semibold">
                    {availabilityFormik.values.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </span>
                  ?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAvailabilityModal(false)}
                  disabled={availabilityFormik.isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdateAvailability}
                  disabled={availabilityFormik.isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {availabilityFormik.isSubmitting ? (
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
    </div>
  );
}
