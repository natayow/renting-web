import React from "react";
import Image from "next/image";

export default function PromoBanner() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <img
          className="rounded-xl"
          src="static/PromoBanner.jpg"
          alt="Promotional Banner"
        />
      </div>
    </section>
  );
}
