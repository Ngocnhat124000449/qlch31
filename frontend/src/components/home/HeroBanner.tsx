"use client";

import { useEffect, useState } from "react";
import styles from "./HeroBanner.module.scss";
import SmartImage from "@/components/ui/SmartImage";

interface Banner {
  bannerid?: string | number;
  ten?: string;
  mota?: string;
  imageUrl?: string;
  imageurl?: string;
  hinhanh?: string;
  hinhanhurl?: string;
  linkurl?: string;
  vitri?: string;
  trangthai?: boolean;
}

interface HeroBannerProps {
  banners?: Banner[];
}

export default function HeroBanner({
  banners = [],
}: HeroBannerProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-rotate banners every 3 seconds
  useEffect(() => {
    if (!banners || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000); // 3 giây

    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        <div className="relative h-[360px] bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Không có banner</p>
        </div>
      </div>
    );
  }

  const banner = banners[currentIndex];
  const imageUrl =
    banner?.imageUrl ||
    banner?.imageurl ||
    banner?.hinhanh ||
    banner?.hinhanhurl ||
    null;

  const goToPrevious = (): void => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = (): void => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number): void => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border border-border bg-card group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[360px]">
        {/* Banner Image */}
        <SmartImage
          src={imageUrl}
          alt={banner?.ten || "banner"}
          className="h-full w-full object-cover transition-opacity duration-500"
        />

        {/* Banner Title & Description */}
        {(banner?.ten || banner?.mota) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            {banner?.ten && (
              <h2 className="text-xl font-bold mb-1">{banner.ten}</h2>
            )}
            {banner?.mota && (
              <p className="text-sm text-gray-200 line-clamp-2">
                {banner.mota}
              </p>
            )}
          </div>
        )}

        {/* Navigation Arrows - chỉ hiện khi hover */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous banner"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next banner"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Indicators/Dots - chỉ hiện khi có nhiều banner */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-2 py-3 bg-gray-50">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-blue-500 w-8"
                  : "bg-gray-300 w-2 hover:bg-gray-400"
              }`}
              aria-label={`Go to banner ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
