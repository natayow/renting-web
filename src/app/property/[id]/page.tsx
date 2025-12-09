"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import {
  IoBedOutline,
  IoWaterOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoTvOutline,
  IoSnowOutline,
  IoWifiOutline,
  IoCarOutline,
  IoRestaurantOutline,
  IoCafeOutline,
  IoFlameOutline,
  IoCallOutline,
  IoLaptopOutline,
  IoShirtOutline,
  IoHomeOutline,
  IoLocationOutline,
} from "react-icons/io5";
import {
  MdOutlineLocalLaundryService,
  MdOutlineKitchen,
  MdOutlinePool,
  MdOutlineFitnessCenter,
  MdOutlineElevator,
} from "react-icons/md";
import { BiFridge } from "react-icons/bi";

interface PropertyImage {
  id: string;
  url: string;
  propertyId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface Location {
  id: string;
  city: string;
  country: string;
  address: string;
}

interface PropertyType {
  id: string;
  name: string;
}

interface Facility {
  id: string;
  name: string;
  icon: string | null;
}

interface PropertyFacility {
  id: string;
  propertyId: string;
  facilityId: string;
  facility: Facility;
}

interface Property {
  id: string;
  title: string;
  description: string | null;
  basePricePerNightIdr: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  status: string;
  images: PropertyImage[];
  location: Location;
  type: PropertyType | null;
  facilities: PropertyFacility[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Property;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [guests, setGuests] = useState(1);
  const [moveInDate, setMoveInDate] = useState<Date | null>(null);
  const [moveOutDate, setMoveOutDate] = useState<Date | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProperty(params.id as string);
    }
  }, [params.id]);

  const fetchProperty = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get<ApiResponse>(
        `/api/properties/${id}`
      );

      if (response.data.success) {
        setProperty(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch property");
      }
    } catch (err: any) {
      console.error("Error fetching property:", err);
      setError(err.response?.data?.message || "Failed to load property");
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

  const handleContinueBooking = () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    console.log("Booking:", { moveInDate, moveOutDate, guests });
  };

  const handleGuestChange = (increment: boolean) => {
    if (increment && property && guests < property.maxGuests) {
      setGuests(guests + 1);
    } else if (!increment && guests > 1) {
      setGuests(guests - 1);
    }
  };

  const getFacilityIcon = (iconName: string | null) => {
    if (!iconName) return <IoHomeOutline className="text-2xl text-gray-600" />;

    const key = iconName.toLowerCase();

    const iconMap: { [key: string]: React.ReactNode } = {
      tv: <IoTvOutline className="text-2xl text-gray-600" />,
      fridge: <BiFridge className="text-2xl text-gray-600" />,
      fireplace: <IoFlameOutline className="text-2xl text-gray-600" />,
      phone: <IoCallOutline className="text-2xl text-gray-600" />,
      "work desk": <IoLaptopOutline className="text-2xl text-gray-600" />,
      kettle: <IoCafeOutline className="text-2xl text-gray-600" />,
      "coffee machine": <IoCafeOutline className="text-2xl text-gray-600" />,
      dishes: <IoRestaurantOutline className="text-2xl text-gray-600" />,
      "washing machine": (
        <MdOutlineLocalLaundryService className="text-2xl text-gray-600" />
      ),
      dryer: <IoShirtOutline className="text-2xl text-gray-600" />,
      iron: <IoShirtOutline className="text-2xl text-gray-600" />,
      wardrobe: <IoShirtOutline className="text-2xl text-gray-600" />,
      wifi: <IoWifiOutline className="text-2xl text-gray-600" />,
      parking: <IoCarOutline className="text-2xl text-gray-600" />,
      pool: <MdOutlinePool className="text-2xl text-gray-600" />,
      gym: <MdOutlineFitnessCenter className="text-2xl text-gray-600" />,
      kitchen: <MdOutlineKitchen className="text-2xl text-gray-600" />,
      "air conditioning": <IoSnowOutline className="text-2xl text-gray-600" />,
      heating: <IoFlameOutline className="text-2xl text-gray-600" />,
      elevator: <MdOutlineElevator className="text-2xl text-gray-600" />,
    };

    return iconMap[key] || <IoHomeOutline className="text-2xl text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="w-full h-96 bg-gray-300 rounded-2xl mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="h-32 bg-gray-300 rounded" />
              </div>
              <div className="h-64 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || "Property not found"}</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-[##064749] text-white rounded-lg hover:bg-[#064749] transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gray-200 mb-4">
            {property.images && property.images.length > 0 ? (
              <Image
                src={`http://localhost:8000/uploads/images/${property.images[selectedImageIndex].url}`}
                alt={property.title}
                fill
                unoptimized
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                No Image Available
              </div>
            )}
          </div>

          {property.images && property.images.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {property.images.slice(0, 5).map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-full aspect-square rounded-lg overflow-hidden ${
                    selectedImageIndex === index
                      ? "ring-2 ring-[#064749]"
                      : "opacity-70 hover:opacity-100"
                  } transition`}
                >
                  <Image
                    src={`http://localhost:8000/uploads/images/${image.url}`}
                    alt={`${property.title} - ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              <p className="text-gray-600 mb-1">
                {property.location.city}, {property.location.country}
              </p>
              <div className="flex items-start gap-2 text-gray-600 mb-4">
                <IoLocationOutline className="text-lg mt-0.5 shrink-0" />
                <span className="text-sm">{property.location.address}</span>
              </div>

              <div className="flex flex-wrap gap-6 text-gray-700">
                <div className="flex items-center gap-2">
                  <IoBedOutline className="text-xl" />
                  <span>
                    {property.beds} bed{property.beds !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IoWaterOutline className="text-xl" />
                  <span>
                    {property.bathrooms} bathroom
                    {property.bathrooms !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IoPersonOutline className="text-xl" />
                  <span>Max {property.maxGuests} guests</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-300" />

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {property.description || "No description available."}
              </p>
            </div>

            <hr className="border-gray-300" />

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Amenities
              </h2>
              {property.facilities && property.facilities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.facilities.map((pf) => (
                    <div
                      key={pf.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#064749] transition"
                    >
                      <div className="shrink-0">
                        {getFacilityIcon(pf.facility.icon)}
                      </div>
                      <span className="text-gray-800">{pf.facility.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No amenities listed.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="mb-6 flex items-baseline gap-1">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(property.basePricePerNightIdr)}
                </div>
                <div className="text-gray-600">/ night</div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <IoCalendarOutline />
                      Move In
                    </div>
                  </label>
                  <DatePicker
                    selected={moveInDate}
                    onChange={(date) => setMoveInDate(date)}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select move in date"
                    className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    wrapperClassName="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <IoCalendarOutline />
                      Move Out
                    </div>
                  </label>
                  <DatePicker
                    selected={moveOutDate}
                    onChange={(date) => setMoveOutDate(date)}
                    minDate={moveInDate || new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select move out date"
                    disabled={!moveInDate}
                    className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    wrapperClassName="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <div className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleGuestChange(false)}
                      disabled={guests <= 1}
                      className="text-2xl  font-semibold text-gray-600 hover:text-gray-900"
                    >
                      −
                    </button>
                    <span className="text-lg text-gray-500 font-medium">
                      {guests}
                    </span>
                    <button
                      onClick={() => handleGuestChange(true)}
                      disabled={guests >= property.maxGuests}
                      className="text-2xl font-semibold text-gray-600 hover:text-gray-900 "
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  All utilities are included
                </p>
              </div>

              <button
                onClick={handleContinueBooking}
                disabled={status === "loading"}
                className="w-full py-3 bg-[#064749] text-white font-semibold rounded-full cursor-pointer hover:bg-[#053638] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {status === "unauthenticated"
                  ? "Login to Continue Booking"
                  : "Continue Booking"}
              </button>

              {status === "unauthenticated" && (
                <p className="mt-3 text-xs text-gray-500 text-center">
                  You need to login before making a reservation
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
