/**
 * Page (/)
 * - Entry của route gốc.
 * - Giữ file mỏng: render HomePage từ components để dễ mở rộng khi dự án có nhiều trang.
 */

import HomePage from "@/components/home/HomePage";

export default function Page() {
  return <HomePage />;
}
