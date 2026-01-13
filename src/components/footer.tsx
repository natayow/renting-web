import React from "react";
import { RiHome9Fill } from "react-icons/ri";

export default function Footer() {
  return (
    <section className="bg-[#064749] py-8 md:py-16 px-4 md:px-8 lg:px-20 text-white text-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 max-w-screen-xl mx-auto">
        <div className="flex flex-col gap-3 items-center md:items-start">
          <div className="flex items-center justify-center gap-2">
            <RiHome9Fill className="text-3xl md:text-4xl text-white" />
            <p className="text-white text-base md:text-xl font-light">
              FLEX LIVING
            </p>
          </div>
          <p className="text-sm font-extralight text-center md:text-left">
            Copyright © 2024 - All right reserved by Flex Living
          </p>
        </div>

        <div className="text-center md:text-left">
          <p>Contact us</p>
          <p className="font-bold">flexliving@gmail.com</p>
        </div>
      </div>
    </section>
  );
}
