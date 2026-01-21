import React, { Suspense } from "react";
import BookingContent from "./BookingContent";

export default function BookingPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <BookingContent />
    </Suspense>
  );
}
