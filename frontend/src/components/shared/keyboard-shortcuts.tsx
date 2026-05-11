"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface ShortcutEntry {
  keys: string[];
  label: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutEntry[];
}

export function KeyboardShortcuts() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  // Listen for custom event dispatched by Command Palette
  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
    }

    window.addEventListener("open-keyboard-shortcuts", handleOpen);
    return () => window.removeEventListener("open-keyboard-shortcuts", handleOpen);
  }, []);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const groups: ShortcutGroup[] = [
    {
      title: t("shortcuts.groups.general"),
      shortcuts: [
        { keys: ["⌘", "K"], label: t("shortcuts.items.commandPalette") },
        { keys: ["Esc"], label: t("shortcuts.items.closeDialog") },
      ],
    },
    {
      title: t("shortcuts.groups.commandPalette"),
      shortcuts: [
        { keys: ["↑", "↓"], label: t("shortcuts.items.navigate") },
        { keys: ["↵"], label: t("shortcuts.items.selectItem") },
        { keys: ["Esc"], label: t("shortcuts.items.closePalette") },
      ],
    },
    {
      title: t("shortcuts.groups.navigation"),
      shortcuts: [
        { keys: ["⌘", "K"], label: t("shortcuts.items.quickSearch") },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative flex items-start justify-center pt-[15vh]">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("shortcuts.title")}
          className="w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-150 rounded-xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h2 className="text-sm font-medium text-zinc-100">
              {t("shortcuts.title")}
            </h2>
            <button
              type="button"
              onClick={close}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto p-4 flex flex-col gap-5">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  {group.title}
                </h3>
                <div className="flex flex-col gap-2">
                  {group.shortcuts.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-zinc-300">
                        {shortcut.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <kbd
                            key={j}
                            className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-white/10 bg-zinc-900 px-1.5 text-[11px] font-medium text-zinc-400"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
