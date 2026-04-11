"use client";
import styles from "./HeroSection.module.scss";

import CategorySidebar from "./CategorySidebar";
import HeroBanner from "./HeroBanner";
import ServiceHighlights from "./ServiceHighlights";

export default function HeroSection() {
  return (
    <section className="pt-10">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <CategorySidebar />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <HeroBanner />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <ServiceHighlights />
        </div>
      </div>
    </section>
  );
}
