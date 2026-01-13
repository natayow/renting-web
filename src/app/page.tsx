import Footer from "@/components/footer";
import Hero from "@/components/hero";
import PromoBanner from "@/components/promobanner";
import PropertyList from "@/components/propertyList";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Hero />
      <PromoBanner />
      <PropertyList />
      <Footer />
    </main>
  );
}
