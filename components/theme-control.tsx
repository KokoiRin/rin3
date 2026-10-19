"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    RinTheme?: {
      setPreference: (value: "light" | "dark" | "system") => void;
      getPreference: () => "light" | "dark" | "system";
      getResolvedTheme: () => "light" | "dark";
      mountControl: (container: HTMLElement) => void;
    };
  }
}

// The shared runtime owns its children only after React has hydrated the host.
export default function ThemeControl() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (host.current) window.RinTheme?.mountControl(host.current);
  }, []);

  return <div ref={host} className="rin-theme-floating" data-theme-control data-theme-react />;
}
