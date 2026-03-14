"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function AntiDevTools() {
  const [blocked, setBlocked] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isMac = useMemo(() => {
    if (typeof window === "undefined") return false;
    return navigator.platform.toLowerCase().includes("mac");
  }, []);

  useEffect(() => {
    const onContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const k = (e.key || "").toLowerCase();
      const combos =
        (e.ctrlKey && e.shiftKey && ["i", "j", "c", "k"].includes(k)) ||
        (e.ctrlKey && k === "u") ||
        (isMac && e.metaKey && e.altKey && k === "i") ||
        e.key === "F12";
      if (combos) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const detect = () => {
      const w = window.outerWidth - window.innerWidth;
      const h = window.outerHeight - window.innerHeight;
      const t = 160;
      const open = w > t || h > t;
      setBlocked(open);
      if (open) {
        if (overlayRef.current) {
          overlayRef.current.style.display = "flex";
        }
      } else {
        if (overlayRef.current) {
          overlayRef.current.style.display = "none";
        }
      }
    };
    document.addEventListener("contextmenu", onContextMenu, { capture: true });
    document.addEventListener("keydown", onKeyDown, { capture: true });
    const id = setInterval(detect, 800);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu, { capture: true } as any);
      document.removeEventListener("keydown", onKeyDown, { capture: true } as any);
      clearInterval(id);
    };
  }, [isMac]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        zIndex: 2147483647,
        alignItems: "center",
        justifyContent: "center",
        display: blocked ? "flex" : "none",
        backdropFilter: "blur(2px)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Access Restricted</h2>
        <p style={{ marginTop: "8px", fontSize: "14px" }}>
          Developer tools are disabled on this site.
        </p>
      </div>
    </div>
  );
}
