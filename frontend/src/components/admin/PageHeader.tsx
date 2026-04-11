"use client";
import styles from "./PageHeader.module.scss";

import GradientButton from "./GradientButton";

export default function PageHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      {actionLabel ? (
        <GradientButton onClick={onAction}>
          <span className="text-foreground">{actionLabel}</span>
        </GradientButton>
      ) : null}
    </div>
  );
}
