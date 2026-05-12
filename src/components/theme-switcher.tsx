"use client";

import { Check, Palette } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const storageKey = "you-deserve-theme";

const themes = [
  {
    id: "matcha",
    label: "雾白玻璃",
    note: "Apple light / Ice blue / Soft graphite",
    swatches: ["#f5f5f7", "#ffffff", "#0071e3", "#111113"],
    themeColor: "#f5f5f7"
  },
  {
    id: "ocean",
    label: "晴空蓝",
    note: "Slate / Blue / Fresh green",
    swatches: ["#eaf2ff", "#0f80a7", "#ee5d5b", "#f3b63f"],
    themeColor: "#f6f9ff"
  },
  {
    id: "coral",
    label: "珊瑚冲刺",
    note: "Warm paper / Coral / Teal",
    swatches: ["#fff8f2", "#d84c3c", "#2f7777", "#efbd54"],
    themeColor: "#fff8f2"
  },
  {
    id: "graphite",
    label: "石墨纸感",
    note: "Graphite / Warm neutral / Moss",
    swatches: ["#f3f2ee", "#17191c", "#3b7471", "#dfb546"],
    themeColor: "#f3f2ee"
  },
  {
    id: "indigo",
    label: "靛蓝夜课",
    note: "Indigo tint / Teal / Berry",
    swatches: ["#f7f5ff", "#276b86", "#cf4d76", "#e8bd50"],
    themeColor: "#f7f5ff"
  }
] as const;

type ThemeId = (typeof themes)[number]["id"];

function isThemeId(value: string | null): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

function applyTheme(themeId: ThemeId) {
  const selected = themes.find((theme) => theme.id === themeId) ?? themes[0];

  document.documentElement.dataset.theme = selected.id;
  document.querySelector<HTMLMetaElement>("meta[name='theme-color']")?.setAttribute("content", selected.themeColor);
  window.localStorage.setItem(storageKey, selected.id);
}

export function ThemeSwitcher() {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window === "undefined") {
      return "ocean";
    }

    const stored = window.localStorage.getItem(storageKey);
    return isThemeId(stored) ? stored : "ocean";
  });
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeTheme = useMemo(() => themes.find((theme) => theme.id === themeId) ?? themes[0], [themeId]);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="theme-switcher" ref={panelRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="theme-trigger"
        onClick={() => setOpen((value) => !value)}
        title="切换配色"
        type="button"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden lg:inline">{activeTheme.label}</span>
      </button>

      {open ? (
        <div className="theme-menu" role="menu">
          <div className="theme-menu-head">
            <span>主题配色</span>
            <small>{themes.length} 套</small>
          </div>
          <div className="theme-options">
            {themes.map((theme) => {
              const active = theme.id === themeId;

              return (
                <button
                  className={`theme-option ${active ? "is-active" : ""}`}
                  key={theme.id}
                  onClick={() => {
                    setThemeId(theme.id);
                    setOpen(false);
                  }}
                  role="menuitem"
                  type="button"
                >
                  <span className="theme-swatch-group" aria-hidden="true">
                    {theme.swatches.map((color) => (
                      <span className="theme-swatch" key={`${theme.id}-${color}`} style={{ backgroundColor: color }} />
                    ))}
                  </span>
                  <span className="theme-option-copy">
                    <strong>{theme.label}</strong>
                    <small>{theme.note}</small>
                  </span>
                  {active ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
