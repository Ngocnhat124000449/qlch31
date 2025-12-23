export function formatVND(value) {
  // API trả giá dạng string/number; nhiều chỗ product list không có giá.
  // Nếu giá không hợp lệ -> hiển thị "—" thay vì 0đ.
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}
