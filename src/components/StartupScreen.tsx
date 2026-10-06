"use client";

import Image from "next/image";
import { useEffect } from "react";

export type StartupState = {
  progress: number;
  label: string;
  status: "loading" | "ready" | "error";
};

export function StartupScreen({ state, canContinue, onContinue, onRetry, onComplete }: {
  state: StartupState;
  canContinue: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onComplete: () => void;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  return (
    <div className={`startup-screen ${state.status === "ready" ? "is-ready" : ""}`}
      role="region" aria-label="Khởi động Spark" aria-busy={state.status === "loading"}
      onAnimationEnd={(event) => { if (event.animationName === "startup-reveal") onComplete(); }}>
      <div className="startup-content">
        <Image src="/brand/spark-logo-negative-v2.svg" alt="Spark" width={320} height={120} priority className="startup-logo" />
        <div className="startup-progress" role="progressbar" aria-label="Tiến trình khởi động" aria-valuemin={0} aria-valuemax={100} aria-valuenow={state.progress} aria-valuetext={`${state.progress}% · ${state.label}`}>
          <span style={{ width: `${state.progress}%` }} />
        </div>
        <div className="startup-caption" role="status"><span>{state.label}</span><span>{state.progress}%</span></div>
        {state.status === "error" && <div className="startup-actions">
          <button type="button" onClick={onRetry}>Thử lại</button>
          {canContinue && <button type="button" onClick={onContinue}>Dùng dữ liệu đã lưu</button>}
        </div>}
      </div>
    </div>
  );
}
