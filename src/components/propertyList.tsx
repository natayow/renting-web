"use client";

import React, { useEffect, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";
import Link from "next/link";

// Type definitions based on your Prisma schema
interface PropertyImage {
  id: string;
  url: string;
  propertyId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface Location {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
}

interface PropertyType {
  id: string;
  name: string;
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
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Property[];
}

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only ACTIVE properties
      const response = await axiosInstance.get<ApiResponse>("/api/properties", {
        params: {
          status: "ACTIVE",
        },
      });

      if (response.data.success) {
        setProperties(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch properties");
      }
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setError(err.response?.data?.message || "Failed to load properties");
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

  if (loading) {
    return (
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center mb-4">
            <h2 className="text-lg text-[#181A18] font-semibold">
              Available Properties
            </h2>
            <IoIosArrowForward className="text-xl text-[#181A18]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="w-full aspect-square rounded-2xl bg-gray-300" />
                <div className="py-2 px-1">
                  <div className="h-4 bg-gray-300 rounded mb-2" />
                  <div className="h-3 bg-gray-300 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center mb-4">
            <h2 className="text-lg text-[#181A18] font-semibold">
              Available Properties
            </h2>
            <IoIosArrowForward className="text-xl text-[#181A18]" />
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProperties}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center mb-4">
            <h2 className="text-lg text-[#181A18] font-semibold">
              Available Properties
            </h2>
            <IoIosArrowForward className="text-xl text-[#181A18]" />
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">
              No properties available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-4">
          <h2 className="text-lg text-[#181A18] font-semibold">
            Available Properties
          </h2>
          <IoIosArrowForward className="text-xl text-[#181A18]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/property/${property.id}`}
              className="group cursor-pointer"
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <Image
                    src={`http://localhost:8000/uploads/${property.images[0].url}`}
                    alt={property.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              <div className="py-2 px-1">
                <h3 className="text-sm text-[#181A18] font-semibold truncate group-hover:text-blue-600 transition">
                  {property.title}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  {property.location.city || property.location.name}
                </p>
                <p className="text-gray-600 font-extralight text-sm">
                  {formatPrice(property.basePricePerNightIdr)} / night
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
