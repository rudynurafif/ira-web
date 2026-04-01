"use client";

import { ReactSelectType } from "@/app/_shared/types/form";
import React from "react";
import Select, { StylesConfig } from "react-select";

type Props = {
  label: string;
  name: string;
  isImportant: boolean;
  options: ReactSelectType[];
  value: string;
  onChange: (value: ReactSelectType | null) => void;
  error: string;
  [key: string]: any;
  isDisabled?: boolean;
};

function DynamicSelectForm({
  label,
  name,
  isImportant,
  options,
  value,
  onChange,
  error,
  isDisabled,
  ...props
}: Props) {
  const selectStyles: StylesConfig = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (styles, state) => ({
      ...styles,
      backgroundColor: isDisabled ? "#f5f5f5" : "#F7F9FD", // abu-abu saat disabled
      borderRadius: "12px",
      border: `1px solid ${
        error ? "#FF0000" : isDisabled ? "#ccc" : "#D5D5D5"
      }`,
      padding: "6px 12px",
      marginTop: "8px",
      cursor: isDisabled ? "not-allowed" : "pointer", // ubah kursor
      opacity: isDisabled ? 0.7 : 1, // opsional: transparansi
      color: isDisabled ? "#888" : styles.color, // teks abu-abu jika disabled
    }),
    singleValue: (styles) => ({
      ...styles,
      color: isDisabled ? "#888" : "#000", // pastikan teks tetap readable
      opacity: isDisabled ? 0.8 : 1,
    }),
    indicatorsContainer: (styles) => ({
      ...styles,
      cursor: isDisabled ? "not-allowed" : "pointer",
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      cursor: isDisabled ? "not-allowed" : "pointer",
      color: isDisabled ? "#ccc" : styles.color, // panah abu-abu saat disabled
    }),
  };

  // ID deterministik dan konsisten SSR/CSR
  const instanceId = `select-${name}`;
  const inputId = `${name}-input`;
  const labelId = `${name}-label`;

  return (
    <div id={`scroll-target-${name}`} className="scroll-mt-20">
      <label id={labelId} htmlFor={inputId} className="text-muted">
        {label}
        {isImportant && <span>*</span>}
      </label>

      <Select
        // KUNCI: set ID stabil
        instanceId={instanceId}
        isDisabled={isDisabled}
        inputId={inputId}
        name={name}
        aria-labelledby={labelId}
        id={name}
        options={options}
        styles={selectStyles}
        value={
          value
            ? (options.find((option) => option.value.toString() === value) ??
              null)
            : null
        }
        onChange={(e: any) => onChange(e)}
        // (opsional) hindari portal saat SSR
        // menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
        {...props}
      />

      {error && <p className="text-red-500 p-0 m-0">{error}</p>}
    </div>
  );
}

export default DynamicSelectForm;
