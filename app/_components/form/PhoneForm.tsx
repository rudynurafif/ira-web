"use client";

import React, { useEffect, useState } from "react";
import {
  PHONE_REGEX,
  getPhoneHistory,
  savePhoneToHistory,
} from "@/app/_shared/utils";

type Props = {
  label: string;
  name: string;
  value: string;
  isImportant?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function PhoneNumberForm({
  label,
  name,
  value,
  isImportant = false,
  error,
  disabled,
  placeholder = "contoh: 08123456789",
  onChange,
}: Props) {
  const [phoneHistory, setPhoneHistory] = useState<string[]>([]);

  useEffect(() => {
    setPhoneHistory(getPhoneHistory());
  }, []);

  const ONLY_DIGITS = /[^\d]/g;

  const MAX_LENGTH = 15;

  const handleChange = (raw: string) => {
    const digitsOnly = raw.replace(ONLY_DIGITS, "").slice(0, MAX_LENGTH);
    onChange(digitsOnly);

    if (PHONE_REGEX.test(digitsOnly)) {
      savePhoneToHistory(digitsOnly);
      setPhoneHistory(getPhoneHistory());
    }
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    handleChange(pasted);
  };

  return (
    <div>
      <label htmlFor={name} className="text-muted">
        {label}
        {isImportant && <span className="">*</span>}
      </label>

      <div className="mt-2">
        <input
          type="tel"
          name={name}
          value={value}
          disabled={disabled}
          list={`ira-phone-history-${name}`}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={`px-5 py-3 w-full rounded-xl bg-primary-spectrum
            disabled:bg-[#f5f5f5] disabled:cursor-not-allowed
            border ${error ? "border-red-500" : "border-[#D5D5D5]"}
            placeholder:text-gray-400 placeholder:text-sm`}
        />

        <datalist id={`ira-phone-history-${name}`}>
          {phoneHistory.map((phone, idx) => (
            <option key={idx} value={phone} />
          ))}
        </datalist>
      </div>

      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
    </div>
  );
}
