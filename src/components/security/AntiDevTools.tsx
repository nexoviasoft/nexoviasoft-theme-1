"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function AntiDevTools() {
  const [blocked, setBlocked] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const originalFetchRef = useRef<typeof window.fetch | null>(null);
  const originalXHROpenRef = useRef<XMLHttpRequest["open"] | null>(null);
  const originalXHRSendRef = useRef<XMLHttpRequest["send"] | null>(null);
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
        (e.ctrlKey && e.shiftKey && ["i", "j", "c", "p", "e"].includes(k)) ||
        (e.metaKey && e.shiftKey && ["i", "j", "c", "p", "e"].includes(k)) ||
        (e.ctrlKey && ["u", "s"].includes(k)) ||
        (e.metaKey && ["u", "s"].includes(k)) ||
        (isMac && e.metaKey && e.altKey && ["i", "j", "c"].includes(k)) ||
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
    window.addEventListener("resize", detect, { capture: true });
    const id = setInterval(detect, 800);
    detect();
    return () => {
      document.removeEventListener("contextmenu", onContextMenu, { capture: true } as any);
      document.removeEventListener("keydown", onKeyDown, { capture: true } as any);
      window.removeEventListener("resize", detect, { capture: true } as any);
      clearInterval(id);
    };
  }, [isMac]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (blocked) {
      if (!originalFetchRef.current) originalFetchRef.current = window.fetch;
      window.fetch = (async () => {
        throw new Error("Network blocked");
      }) as any;
      if (!originalXHROpenRef.current) originalXHROpenRef.current = XMLHttpRequest.prototype.open;
      if (!originalXHRSendRef.current) originalXHRSendRef.current = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, ...args: any[]) {
        return originalXHROpenRef.current!.apply(this, args as any);
      } as any;
      XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, ..._args: any[]) {
        try {
          this.abort();
        } catch {}
      } as any;
    } else {
      if (originalFetchRef.current) window.fetch = originalFetchRef.current;
      if (originalXHROpenRef.current) XMLHttpRequest.prototype.open = originalXHROpenRef.current as any;
      if (originalXHRSendRef.current) XMLHttpRequest.prototype.send = originalXHRSendRef.current as any;
    }
  }, [blocked]);

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
