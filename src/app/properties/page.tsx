"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface PropertyImage {
  id: string;
  url: string;
  propertyId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface Location {
  id: string;
  name?: string;
  city: string;
  state?: string;
  country: string;
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
  minPricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  status: string;
  images: PropertyImage[];
  location: Location;
  type: PropertyType | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Property[];
  pagination: Pagination;
}

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("typeId") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "name");
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "asc"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    setSearch(searchFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchProperties();
  }, [currentPage, search, categoryFilter, sortBy, sortOrder]);

  const fetchPropertyTypes = async () => {
    try {
      const response = await axiosInstance.get("/api/property-types");
      if (response.data.success) {
        setPropertyTypes(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching property types:", err);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        status: "ACTIVE",
        page: currentPage,
        limit: 12,
      };

      if (search) params.search = search;
      if (categoryFilter) params.typeId = categoryFilter;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const response = await axiosInstance.get<ApiResponse>("/api/properties", {
        params,
      });

      if (response.data.success) {
        setProperties(response.data.data);
        setPagination(response.data.pagination);
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

  const handleCategoryChange = (typeId: string) => {
    setCategoryFilter(typeId);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("typeId", categoryFilter);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    if (currentPage > 1) params.set("page", currentPage.toString());

    router.push(`/properties?${params.toString()}`, { scroll: false });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-4xl ${
            i === currentPage
              ? "bg-[#2d4a4a] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (loading && properties.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Available Properties
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="w-full aspect-square rounded-2xl bg-gray-300" />
                <div className="py-2">
                  <div className="h-4 bg-gray-300 rounded mb-2" />
                  <div className="h-3 bg-gray-300 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Available Properties
        </h1>

        <div className="">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#2d4a4a] text-white rounded-full hover:bg-[#1f3535] transition-colors shadow-sm"
                  onClick={() => {
                    const dropdown =
                      document.getElementById("filters-dropdown");
                    dropdown?.classList.toggle("hidden");
                  }}
                >
                  <span className="font-medium">Category</span>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  id="filters-dropdown"
                  className="hidden absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="py-2">
                    <button
                      onClick={() => {
                        handleCategoryChange("");
                        document
                          .getElementById("filters-dropdown")
                          ?.classList.add("hidden");
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        !categoryFilter
                          ? "bg-gray-50 text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      All Categories
                    </button>
                    {propertyTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          handleCategoryChange(type.id);
                          document
                            .getElementById("filters-dropdown")
                            ?.classList.add("hidden");
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          categoryFilter === type.id
                            ? "bg-gray-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {categoryFilter && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {propertyTypes.find((t) => t.id === categoryFilter)?.name}
                  </span>
                  <button
                    onClick={() => handleCategoryChange("")}
                    className="ml-1 text-gray-500 hover:text-gray-700"
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
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const dropdown = document.getElementById("sort-dropdown");
                  dropdown?.classList.toggle("hidden");
                }}
              >
                <span className="text-gray-700 font-medium">Sort by:</span>
                <span className="text-gray-900">
                  {sortBy === "name" ? "Name" : "Price"}
                </span>
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                id="sort-dropdown"
                className="hidden absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="py-2">
                  <button
                    onClick={() => {
                      handleSortChange("name");
                      document
                        .getElementById("sort-dropdown")
                        ?.classList.add("hidden");
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortBy === "name"
                        ? "bg-gray-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    Name{" "}
                    {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </button>
                  <button
                    onClick={() => {
                      handleSortChange("price");
                      document
                        .getElementById("sort-dropdown")
                        ?.classList.add("hidden");
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortBy === "price"
                        ? "bg-gray-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    Price{" "}
                    {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {pagination.total} results
            </span>
            {search && (
              <span className="ml-2">
                for &quot;<span className="font-semibold">{search}</span>&quot;
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchProperties}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {properties.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">
              No properties found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={`http://localhost:8000/uploads/images/${property.images[0].url}`}
                        alt={property.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                        No Image
                      </div>
                    )}
                    {property.type && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                        {property.type.name}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition mb-1">
                      {property.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {property.location.city}, {property.location.country}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {property.maxGuests} guests · {property.bedrooms} bed
                        {property.bedrooms !== 1 ? "rooms" : "room"}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {formatPrice(property.minPricePerNight)}{" "}
                      <span className="text-sm font-normal text-gray-600">
                        / night
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-4xl bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {renderPagination()}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 rounded-4xl bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
