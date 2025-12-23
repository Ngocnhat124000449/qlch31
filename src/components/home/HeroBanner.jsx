import Image from "next/image";

export default function HeroBanner({ banners }) {
  const b = banners?.[0];

  // fallback nếu backend chưa có banner
  const imageUrl =
    b?.imageUrl ||
    b?.hinhanh ||
    "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1600&q=80&auto=format&fit=crop";

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      <div className="relative h-[360px]">
        <Image
          src={imageUrl}
          alt={b?.title || "banner"}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 700px"
          priority
        />
      </div>
    </div>
  );
}
