"use client";

import React, { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";

const removeEmoji = (str: string) => {
  const emojiRegex = /[^\x00-\x7F]+\ *(?:[^\x00-\x7F]| )*/;
  return str.replace(emojiRegex, "");
};

type Props = {
  label: string;
  name: string;
  value: string;
  isImportant?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  labelClass?: string;
  onChange: (value: string) => void;
};

export default function DynamicPasswordForm({
  label,
  name,
  value,
  onChange,
  isImportant = false,
  error,
  placeholder,
  disabled,
  labelClass = "text-muted",
}: Props) {
  const [show, setShow] = useState(false);

  const MAX_LENGTH = 100;

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value;

    // 🔒 sanitasi
    val = removeEmoji(val).replace(/\s+/g, "");

    // 🔒 hard limit 100 karakter
    val = val.slice(0, MAX_LENGTH);

    onChange(val);
  };

  return (
    <div className="relative">
      <label htmlFor={name} className={labelClass}>
        {label}
        {isImportant && <span className="">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="new-password"
          onInput={handleInput}
          className={`px-5 py-3 pr-12 mt-2 w-full rounded-xl bg-primary-spectrum
            disabled:bg-[#f5f5f5] disabled:cursor-not-allowed!
            border ${error ? "border-red-500" : "border-[#D5D5D5]"}
            placeholder:text-gray-400 placeholder:text-sm
            focus:outline-none`}
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-[55%] -translate-y-1/2 text-gray-600"
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        >
          {show ? <IoEye /> : <IoMdEyeOff />}
        </button>
      </div>

      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
    </div>
  );
}
