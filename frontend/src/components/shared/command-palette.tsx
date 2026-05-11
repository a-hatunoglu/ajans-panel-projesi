"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Settings, LogOut, Keyboard } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/i18n/provider";
import { getNavigationItems } from "@/lib/navigation";

interface CommandItem {
  id: string;
  label: string;
  group: string;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build command items from navigation + actions
  const commands = useMemo<CommandItem[]>(() => {
    const userRole = user?.role || "guest";
    const userAgencyRole = user?.agencyRole;
    const navItems = getNavigationItems(t).filter((item) =>
      item.allowedRoles.includes(userRole) ||
      (userAgencyRole && item.allowedRoles.includes(userAgencyRole)),
    );

    const navigation: CommandItem[] = navItems.map((item) => ({
      id: `nav-${item.href}`,
      label: item.label,
      group: t("commandPalette.groups.navigation"),
      href: item.href,
      keywords: [item.label.toLowerCase()],
    }));

    const actions: CommandItem[] = [
      {
        id: "action-settings",
        label: t("commandPalette.actions.settings"),
        group: t("commandPalette.groups.actions"),
        href: "/app/settings",
        keywords: ["settings", "ayarlar", "profil", "profile"],
      },
      {
        id: "action-new-content",
        label: t("commandPalette.actions.newContent"),
        group: t("commandPalette.groups.actions"),
        href: "/app/contents/new",
        keywords: ["new", "create", "yeni", "oluştur", "içerik", "content"],
      },
      {
        id: "action-shortcuts",
        label: t("commandPalette.actions.shortcuts"),
        group: t("commandPalette.groups.actions"),
        action: () => {
          window.dispatchEvent(new Event("open-keyboard-shortcuts"));
        },
        keywords: ["shortcuts", "keyboard", "kısayol", "klavye", "help", "yardım"],
      },
      {
        id: "action-logout",
        label: t("commandPalette.actions.logout"),
        group: t("commandPalette.groups.actions"),
        action: () => logout(),
        keywords: ["logout", "signout", "çıkış", "oturumu kapat"],
      },
    ];

    return [...navigation, ...actions];
  }, [user, t, logout]);

  // Filter commands
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase().trim();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.keywords?.some((kw) => kw.includes(q)),
    );
  }, [commands, query]);

  // Group filtered items
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, [filtered]);

  // Flat list for index-based selection
  const flatList = useMemo(() => {
    return Object.values(grouped).flat();
  }, [grouped]);

  // Open/close
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  // Execute command
  const execute = useCallback(
    (item: CommandItem) => {
      close();
      if (item.href) {
        router.push(item.href);
      } else if (item.action) {
        item.action();
      }
    },
    [close, router],
  );

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, open, close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= flatList.length) {
      setSelectedIndex(Math.max(0, flatList.length - 1));
    }
  }, [flatList.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Internal keyboard navigation
  function handleInputKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (flatList[selectedIndex]) {
          execute(flatList[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative flex items-start justify-center pt-[20vh]">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("commandPalette.title")}
          className="w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-150 rounded-xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-white/5">
            <Search className="h-4 w-4 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={t("commandPalette.placeholder")}
              className="flex-1 h-12 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-white/10 bg-zinc-900 px-1.5 text-[10px] font-medium text-zinc-500">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
            {flatList.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">
                {t("commandPalette.noResults")}
              </div>
            ) : (
              Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    {group}
                  </div>
                  {items.map((item) => {
                    const globalIndex = flatList.indexOf(item);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => execute(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? "bg-white/5 text-white"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <CommandItemIcon item={item} />
                        <span className="flex-1 text-left truncate">
                          {item.label}
                        </span>
                        {isSelected && (
                          <ArrowRight className="h-3 w-3 text-zinc-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 border-t border-white/5 px-4 py-2">
            <div className="flex items-center gap-3 text-[10px] text-zinc-600">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 items-center rounded border border-white/5 bg-zinc-900 px-1 text-[10px]">↑↓</kbd>
                {t("commandPalette.footer.navigate")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 items-center rounded border border-white/5 bg-zinc-900 px-1 text-[10px]">↵</kbd>
                {t("commandPalette.footer.select")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandItemIcon({ item }: { item: CommandItem }) {
  if (item.id === "action-settings") {
    return <Settings className="h-4 w-4 shrink-0 text-zinc-600" />;
  }
  if (item.id === "action-shortcuts") {
    return <Keyboard className="h-4 w-4 shrink-0 text-zinc-600" />;
  }
  if (item.id === "action-logout") {
    return <LogOut className="h-4 w-4 shrink-0 text-zinc-600" />;
  }
  return <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-700" />;
}
