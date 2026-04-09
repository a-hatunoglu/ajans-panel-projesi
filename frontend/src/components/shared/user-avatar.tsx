"use client";

import { useState, useEffect } from "react";

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getInitials(
  name?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null
) {
  if (firstName || lastName) {
    return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();
  }

  if (name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  }

  if (email && email.length >= 2) {
    return email.slice(0, 2).toUpperCase();
  }

  return "?";
}

export function UserAvatar({
  avatarUrl,
  name,
  firstName,
  lastName,
  email,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name, firstName, lastName, email);

  // Reset error state if the URL changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  let sizeClasses = "h-10 w-10 text-sm"; // md default
  if (size === "sm") sizeClasses = "h-8 w-8 text-xs";
  if (size === "lg") sizeClasses = "h-12 w-12 text-base";

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center transition-colors ${sizeClasses} ${className}`}
    >
      {avatarUrl && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name || firstName || ""}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-medium text-zinc-300">
          {initials}
        </span>
      )}
    </div>
  );
}
