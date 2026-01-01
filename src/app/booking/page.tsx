"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axiosInstance from "@/utils/axiosInstance";
import {
  BookingPriceBreakdown,
  BookingFormData,
  BookingResponse,
  ApiResponse,
  PaymentMethod,
} from "@/types/booking.types";
import {
  IoBedOutline,
  IoWaterOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoLocationOutline,
} from "react-icons/io5";

interface PropertyDetails {
  id: string;
  title: string;
  location: {
    city: string;
    country: string;
    address: string;
  };
}

interface RoomDetails {
  id: string;
  name: string;
  maxGuests: number;
  beds: number;
  bathrooms: number;
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data from URL params
  const [propertyId] = useState(searchParams.get("propertyId") || "");
  const [roomId] = useState(searchParams.get("roomId") || "");
  const [checkInDate] = useState(searchParams.get("checkInDate") || "");
  const [checkOutDate] = useState(searchParams.get("checkOutDate") || "");
  const [nights] = useState(Number(searchParams.get("nights")) || 1);
  const [guestsCount] = useState(Number(searchParams.get("guestsCount")) || 1);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("PAYMENT_GATEWAY");
  const [priceBreakdown, setPriceBreakdown] =
    useState<BookingPriceBreakdown | null>(null);
  const [propertyDetails, setPropertyDetails] =
    useState<PropertyDetails | null>(null);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?redirect=/booking?${searchParams.toString()}`);
      return;
    }

    if (status === "authenticated") {
      // Validate required params
      if (!propertyId || !roomId || !checkInDate || !checkOutDate) {
        setError("Missing required booking information");
        return;
      }

      fetchBookingDetails();
    }
  }, [status, propertyId, roomId, checkInDate, checkOutDate]);

  const fetchBookingDetails = async () => {
    setCalculating(true);
    setError(null);

    try {
      // Fetch property details
      const propertyResponse = await axiosInstance.get<ApiResponse<any>>(
        `/api/properties/${propertyId}`
      );

      if (propertyResponse.data.success) {
        const property = propertyResponse.data.data;
        setPropertyDetails({
          id: property.id,
          title: property.title,
          location: property.location,
        });

        // Find room details
        const room = property.rooms?.find((r: any) => r.id === roomId);
        if (room) {
          setRoomDetails({
            id: room.id,
            name: room.name,
            maxGuests: room.maxGuests,
            beds: room.beds,
            bathrooms: room.bathrooms,
          });
        }
      }

      // Calculate price
      const priceResponse = await axiosInstance.post<
        ApiResponse<BookingPriceBreakdown>
      >(`/api/bookings/calculate-price`, {
        roomId,
        checkInDate,
        checkOutDate,
      });

      if (priceResponse.data.success) {
        setPriceBreakdown(priceResponse.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching booking details:", err);
      setError(err.response?.data?.message || "Failed to load booking details");
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (!priceBreakdown) {
      setError("Price calculation not available");
      return;
    }

    console.log("Session data:", session);
    console.log("Access token:", session?.user?.accessToken);

    if (!session?.user?.accessToken) {
      setError("You must be logged in to complete booking");
      router.push(`/login?redirect=/booking?${searchParams.toString()}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData: BookingFormData = {
        propertyId,
        roomId,
        checkInDate,
        checkOutDate,
        nights,
        guestsCount,
        paymentMethod,
      };

      console.log(
        "Sending booking with token:",
        session.user.accessToken.substring(0, 20) + "..."
      );

      // Manually add token to headers as a backup
      const response = await axiosInstance.post<ApiResponse<BookingResponse>>(
        `/api/bookings`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      );

      if (response.data.success) {
        const booking = response.data.data;

        // Redirect to success page
        router.push(`/booking/success?bookingId=${booking.id}`);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      console.error("Error creating booking:", err);
      setError(err.response?.data?.message || "Failed to create booking");
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

  if (status === "loading" || calculating) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-300 rounded-xl" />
              </div>
              <div className="h-96 bg-gray-300 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !priceBreakdown) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button className="btn btn-primary" onClick={() => router.back()}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-15 lg:mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-[#064749] hover:underline mb-4 flex items-center gap-2"
          >
            ← Back to property
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Confirm Your Booking
          </h1>
          <p className="text-gray-600 mt-2">
            Review your booking details and complete payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Information */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-gray-700">Property Details</h2>
                {propertyDetails && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-black">
                      {propertyDetails.title}
                    </h3>
                    <div className="flex items-start gap-2 text-gray-600">
                      <IoLocationOutline className="text-xl mt-0.5 shrink-0" />
                      <span>
                        {propertyDetails.location.address},{" "}
                        {propertyDetails.location.city},{" "}
                        {propertyDetails.location.country}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Room Information */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-gray-700">Room Details</h2>
                {roomDetails && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {roomDetails.name}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <IoBedOutline className="text-xl" />
                        <span className="text-sm">
                          {roomDetails.beds} Bed
                          {roomDetails.beds > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <IoWaterOutline className="text-xl" />
                        <span className="text-sm">
                          {roomDetails.bathrooms} Bath
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <IoPersonOutline className="text-xl" />
                        <span className="text-sm">
                          Max {roomDetails.maxGuests} Guests
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Dates */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-gray-700">Stay Duration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <IoCalendarOutline className="text-2xl text-[#064749] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(checkInDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IoCalendarOutline className="text-2xl text-[#064749] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(checkOutDate)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total nights:</span>
                    <span className="font-semibold text-gray-800">
                      {nights} night{nights > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Number of guests:</span>
                    <span className="font-semibold text-gray-800">
                      {guestsCount} guest{guestsCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-gray-700">Payment Method</h2>
                <select
                  className="select text-gray-700 select-bordered w-full"
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                >
                  <option value="PAYMENT_GATEWAY">
                    Online Payment (Auto-confirm)
                  </option>
                  <option value="BANK_TRANSFER">
                    Bank Transfer (Manual Confirmation)
                  </option>
                </select>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {paymentMethod === "PAYMENT_GATEWAY" ? (
                      <>
                        <strong>Online Payment:</strong> Your booking will be
                        automatically confirmed once payment is successful.
                      </>
                    ) : (
                      <>
                        <strong>Bank Transfer:</strong> You will receive bank
                        details after booking. Your booking will be confirmed
                        after we verify your payment.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-8">
              <div className="card-body">
                <h2 className="card-title text-gray-700">Price Summary</h2>
                {priceBreakdown ? (
                  <div className="space-y-4">
                    {/* Nightly Rates Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Room rate ({nights} nights)</span>
                        <span>
                          {formatPrice(priceBreakdown.nightlySubtotalIdr)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Cleaning fee</span>
                        <span>
                          {formatPrice(priceBreakdown.cleaningFeeIdr)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Service fee</span>
                        <span>{formatPrice(priceBreakdown.serviceFeeIdr)}</span>
                      </div>
                      {priceBreakdown.discountIdr > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>
                            -{formatPrice(priceBreakdown.discountIdr)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-[#064749]">
                          {formatPrice(priceBreakdown.totalPriceIdr)}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}

                    <button
                      className={`bg-[#064749] text-white w-full px-6 py-3 rounded-lg hover:bg-[#053638] transition-all font-medium ${
                        loading ? "loading" : ""
                      }`}
                      onClick={handleSubmitBooking}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Confirm Booking"}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      By confirming, you agree to our terms and conditions
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading price details...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
