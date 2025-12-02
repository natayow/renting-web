import React from "react";
import { IoIosArrowForward } from "react-icons/io";

export default function PropertyList() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center  mb-4">
          <h2 className="text-lg text-[#181A18] font-semibold ">
            Available Properties
          </h2>
          <IoIosArrowForward className="text-xl text-[#181A18]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div>
            <img
              src="/static/property1.jpg"
              alt="Property 1"
              className="w-full aspect-square rounded-2xl bg-amber-400 object-cover"
            />
            <div className="py-2 px-1">
              <h3 className="text-sm text-[#181A18] font-semibold">
                Apartment in Cilandak
              </h3>
              <p className="text-gray-600 font-extralight">
                Rp 1,200,000 / month
              </p>
            </div>
          </div>

          <div>
            <img
              src="/static/property1.jpg"
              alt="Property 1"
              className="w-full aspect-square rounded-2xl bg-amber-400 object-cover"
            />
            <div className="py-2 px-1">
              <h3 className="text-sm text-[#181A18] font-semibold">
                Apartment in Cilandak
              </h3>
              <p className="text-gray-600 font-extralight">
                Rp 1,200,000 / month
              </p>
            </div>
          </div>
          <div>
            <img
              src="/static/property1.jpg"
              alt="Property 1"
              className="w-full aspect-square rounded-2xl bg-amber-400 object-cover"
            />
            <div className="py-2 px-1">
              <h3 className="text-sm text-[#181A18] font-semibold">
                Apartment in Cilandak
              </h3>
              <p className="text-gray-600 font-extralight">
                Rp 1,200,000 / month
              </p>
            </div>
          </div>
          <div>
            <img
              src="/static/property1.jpg"
              alt="Property 1"
              className="w-full aspect-square rounded-2xl bg-amber-400 object-cover"
            />
            <div className="py-2 px-1">
              <h3 className="text-sm text-[#181A18] font-semibold">
                Apartment in Cilandak
              </h3>
              <p className="text-gray-600 font-extralight">
                Rp 1,200,000 / month
              </p>
            </div>
          </div>
          <div>
            <img
              src="/static/property1.jpg"
              alt="Property 1"
              className="w-full aspect-square rounded-2xl bg-amber-400 object-cover"
            />
            <div className="py-2 px-1">
              <h3 className="text-sm text-[#181A18] font-semibold">
                Apartment in Cilandak
              </h3>
              <p className="text-gray-600 font-extralight">
                Rp 1,200,000 / month
              </p>
            </div>
          </div>
          <div>
            <img
              src="/static/property1.jpg"
              alt="Property 1"
              className="w-full aspect-square rounded-2xl bg-amber-400 object-cover"
            />
            <div className="py-2 px-1">
              <h3 className="text-sm text-[#181A18] font-semibold">
                Apartment in Cilandak
              </h3>
              <p className="text-gray-600 font-extralight">
                Rp 1,200,000 / month
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
