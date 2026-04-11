"use client";

/**
 * SmartImage
 * - Tránh lỗi domain của next/image khi backend trả ảnh từ nhiều nguồn.
 * - Không dùng ảnh "demo/fake" fallback. Nếu không có src => render placeholder.
 */

export default function SmartImage({
  src,
  alt = "",
  className = "",
  style,
  ...rest
}) {
  if (!src) {
    return (
      <div
        className={`grid place-items-center bg-muted/50 text-xs text-muted-foreground ${className}`}
        style={style}
        {...rest}
      >
        Không có ảnh
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      {...rest}
    />
  );
}
