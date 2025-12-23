import {
  ShieldCheck,
  Headset,
  Truck,
  RotateCcw,
  BadgeCheck,
  Percent,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Bảo hành chính hãng",
    desc: "Bảo hành 24 tháng cho tất cả sản phẩm",
  },
  {
    icon: Headset,
    title: "Hỗ trợ 24/7",
    desc: "Luôn sẵn sàng giải đáp mọi thắc mắc",
  },
  {
    icon: Truck,
    title: "Giao hàng nhanh chóng",
    desc: "Nhận hàng chỉ trong 2-3 ngày làm việc",
  },
  {
    icon: RotateCcw,
    title: "Đổi trả dễ dàng",
    desc: "Đổi trả trong vòng 7 ngày nếu không hài lòng",
  },
  {
    icon: BadgeCheck,
    title: "Sản phẩm chính hãng",
    desc: "Cam kết 100% sản phẩm chính hãng, chất lượng",
  },
  {
    icon: Percent,
    title: "Ưu đãi đặc biệt",
    desc: "Nhận nhiều khuyến mãi hấp dẫn mỗi tuần",
  },
];

export default function FeaturePanel() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="space-y-4">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div key={idx} className="flex gap-3">
              <Icon className="h-5 w-5 text-indigo-300 mt-0.5" />
              <div>
                <div className="text-slate-100 font-semibold">{f.title}</div>
                <div className="text-slate-400 text-sm">{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
