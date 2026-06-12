"use client";

import React from "react";

interface AuthInputProps {
  label: string;
  type: React.HTMLInputTypeAttribute;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function AuthInput({
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
}: AuthInputProps) {
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:ring-2 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
            : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20"
        }`}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
