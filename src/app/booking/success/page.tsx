"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axiosInstance from "@/utils/axiosInstance";
import {
  BookingResponse,
  ApiResponse,
  BookingStatus,
} from "@/types/booking.types";
import {
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoPersonOutline,
} from "react-icons/io5";

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && bookingId) {
      fetchBookingDetails();
    }
  }, [status, bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) {
      setError("Booking ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get<ApiResponse<BookingResponse>>(
        `/api/bookings/${bookingId}`
      );

      if (response.data.success) {
        setBooking(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      console.error("Error fetching booking:", err);
      setError(err.response?.data?.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusInfo = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return {
          icon: (
            <IoCheckmarkCircleOutline className="text-6xl text-green-500" />
          ),
          title: "Booking Confirmed!",
          message:
            "Your booking has been automatically confirmed. You'll receive a confirmation email shortly.",
          color: "green",
        };
      case BookingStatus.WAITING_PAYMENT:
        return {
          icon: <IoTimeOutline className="text-6xl text-yellow-500" />,
          title: "Waiting for Payment",
          message:
            "Please complete your payment to confirm this booking. You have 24 hours to complete the payment.",
          color: "yellow",
        };
      case BookingStatus.WAITING_CONFIRMATION:
        return {
          icon: <IoDocumentTextOutline className="text-6xl text-blue-500" />,
          title: "Waiting for Confirmation",
          message:
            "Your booking is pending confirmation. Please transfer the payment and wait for admin verification.",
          color: "blue",
        };
      default:
        return {
          icon: <IoCheckmarkCircleOutline className="text-6xl text-gray-500" />,
          title: "Booking Created",
          message: "Your booking has been created successfully.",
          color: "gray",
        };
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-300 rounded-xl mb-6" />
            <div className="h-96 bg-gray-300 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-12">
              <p className="text-red-600 mb-4">
                {error || "Booking not found"}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/properties")}
              >
                Browse Properties
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);

  return (
    <div className="min-h-screen mt-15 lg:mt-20 bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body text-center py-8">
            <div className="flex justify-center mb-4">{statusInfo.icon}</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {statusInfo.title}
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              {statusInfo.message}
            </p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body space-y-6">
            {/* Booking ID */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Booking ID</span>
              <span className="font-mono font-semibold text-gray-800">
                {booking.id}
              </span>
            </div>

            {/* Property Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Property
              </h3>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-[#064749]">
                  {booking.property.title}
                </p>
                <div className="flex items-start gap-2 text-gray-600">
                  <IoLocationOutline className="text-xl mt-0.5 shrink-0" />
                  <span>
                    {booking.property.location.address},{" "}
                    {booking.property.location.city},{" "}
                    {booking.property.location.country}
                  </span>
                </div>
              </div>
            </div>

            {/* Room Info */}
            {booking.room && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Room
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Room Name</p>
                    <p className="font-semibold text-gray-800">
                      {booking.room.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Room Capacity</p>
                    <p className="font-semibold text-gray-800">
                      {booking.room.maxGuests} Guests, {booking.room.beds} Beds,{" "}
                      {booking.room.bathrooms} Baths
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stay Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Stay Duration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <IoCalendarOutline className="text-2xl text-[#064749] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(booking.checkInDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IoCalendarOutline className="text-2xl text-[#064749] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(booking.checkOutDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IoPersonOutline className="text-2xl text-[#064749] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-semibold text-gray-800">
                      {booking.guestsCount} guest
                      {booking.guestsCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-gray-600">Total nights: </span>
                <span className="font-semibold text-gray-800">
                  {booking.nights} night{booking.nights > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Room rate ({booking.nights} nights)</span>
                  <span>{formatPrice(booking.nightlySubtotalIdr)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cleaning fee</span>
                  <span>{formatPrice(booking.cleaningFeeIdr)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee</span>
                  <span>{formatPrice(booking.serviceFeeIdr)}</span>
                </div>
                {booking.discountIdr > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(booking.discountIdr)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      Total Paid
                    </span>
                    <span className="text-2xl font-bold text-[#064749]">
                      {formatPrice(booking.totalPriceIdr)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {booking.payments && booking.payments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Payment Status
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold text-gray-800">
                      {booking.payments[0].paymentMethod || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        booking.payments[0].paymentStatus === "SUCCESS"
                          ? "bg-green-100 text-green-800"
                          : booking.payments[0].paymentStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.payments[0].paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="bg-[#064749] text-white w-full px-6 py-3 rounded-lg hover:bg-[#053638] transition-all font-medium"
            onClick={() => router.push("/profile")}
          >
            View My Bookings
          </button>
          <button
            className="bg-white text-[#064749] px-6 py-3 border-[#064749] border-1 rounded-lg hover:bg-[#053638] hover:text-white transition-all font-medium w-full"
            onClick={() => router.push("/properties")}
          >
            Browse More Properties
          </button>
        </div>

        {/* Additional Info */}
        {booking.status === BookingStatus.WAITING_CONFIRMATION && (
          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Bank Transfer Instructions
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>
                  Please transfer the exact amount to the following bank
                  account:
                </p>
                <div className="p-4 bg-gray-50 rounded-lg mt-3">
                  <p className="font-semibold text-gray-800">Bank Name: BCA</p>
                  <p className="font-semibold text-gray-800">
                    Account Number: 1234567890
                  </p>
                  <p className="font-semibold text-gray-800">
                    Account Name: Property Rental Inc.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Reference: {booking.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <p className="text-sm mt-3">
                  After completing the transfer, please wait for admin
                  confirmation. You will receive an email once your payment is
                  verified.
                </p>
              </div>
            </div>
          </div>
        )}

        {booking.status === BookingStatus.CONFIRMED && (
          <div className="card bg-green-50 border-green-200 shadow-xl mt-6">
            <div className="card-body p-6">
              <div className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="text-2xl text-green-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Your Booking is Confirmed!
                  </h3>
                  <p className="text-green-700">
                    A confirmation email has been sent to your registered email
                    address with all the booking details. Please check your
                    inbox and save this information for your reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
