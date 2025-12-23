import SmartImage from "@/components/ui/SmartImage";

export default function HeroBanner({ banners }) {
  const b = banners?.[0];

  const imageUrl = b?.imageUrl || b?.hinhanh || b?.hinhanhurl || null;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      <div className="relative h-[360px]">
        <SmartImage
          src={imageUrl}
          alt={b?.title || "banner"}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
