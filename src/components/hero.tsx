import React from "react";

export default function Hero() {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat h-screen w-full"
      style={{ backgroundImage: "url('/static/Image1.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4">
          Your Next Stay Starts Here
        </h1>
        <p className="text-xl md:text-2xl text-center max-w-2xl">
          Flexible rentals for rooms and properties that fit your lifestyle.
        </p>
      </div>
    </section>
  );
}
