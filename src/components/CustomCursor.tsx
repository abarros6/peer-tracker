"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], [role='checkbox'], label, select, input, textarea, summary";

// Vivid indigo — high contrast against warm cream backgrounds AND warm-toned content
const DOT_COLOR = "oklch(0.45 0.3 275)";
const DOT_COLOR_DARK = "oklch(0.7 0.25 275)";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Use refs for position to avoid re-renders on every mouse move
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    // Lerp the ring toward the dot for a trailing feel
    ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
    ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Only enable on pointer (non-touch) devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        setHovering(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        setHovering(false);
      }
    };

    const onMouseDown = () => setClicking(true);
    const onMouseUp = () => setClicking(false);

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    // Track dark mode
    const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
    const checkDark = () => {
      setIsDark(
        document.documentElement.classList.contains("dark") || darkMq.matches
      );
    };
    checkDark();
    darkMq.addEventListener("change", checkDark);
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    rafId.current = requestAnimationFrame(animate);

    return () => {
      darkMq.removeEventListener("change", checkDark);
      observer.disconnect();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate, visible]);

  // Don't render on touch devices (SSR-safe)
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  const color = isDark ? DOT_COLOR_DARK : DOT_COLOR;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: clicking ? 6 : 8,
          height: clicking ? 6 : 8,
          marginLeft: clicking ? -3 : -4,
          marginTop: clicking ? -3 : -4,
          borderRadius: "50%",
          backgroundColor: color,
          pointerEvents: "none",
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: "width 0.15s, height 0.15s, margin 0.15s, opacity 0.2s, background-color 0.2s",
          willChange: "transform",
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: hovering ? 48 : clicking ? 28 : 36,
          height: hovering ? 48 : clicking ? 28 : 36,
          marginLeft: hovering ? -24 : clicking ? -14 : -18,
          marginTop: hovering ? -24 : clicking ? -14 : -18,
          borderRadius: "50%",
          border: `2px solid color-mix(in oklch, ${color} ${hovering ? "60%" : "35%"}, transparent)`,
          backgroundColor: hovering ? `color-mix(in oklch, ${color} 8%, transparent)` : "transparent",
          pointerEvents: "none",
          zIndex: 9998,
          opacity: visible ? 1 : 0,
          transition:
            "width 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), margin 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.2s, background-color 0.2s, opacity 0.2s",
          willChange: "transform",
        }}
      />
    </>
  );
}
