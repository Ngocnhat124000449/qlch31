"use client";
import styles from "./GradientButton.module.scss";


export default function GradientButton({ className = "", children, ...props }) {
  return (
    <button
      {...props}
      className={[
        "relative inline-flex items-center gap-2 rounded-full p-[1px] transition hover:opacity-95",
        className,
      ].join(" ")}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
      <span className="relative rounded-full bg-background dark:bg-[#0b1020] px-4 py-2 text-sm font-medium ring-1 ring-border">
        {children}
      </span>
    </button>
  );
}
