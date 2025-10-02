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
};

function DynamicSelectForm({
  label,
  name,
  isImportant,
  options,
  value,
  onChange,
  error,
  ...props
}: Props) {
  const selectStyles: StylesConfig = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (styles) => ({
      ...styles,
      backgroundColor: "#F7F9FD",
      borderRadius: "12px",
      border: `1px solid ${error ? "#FF0000" : "#D5D5D5"}`,
      padding: "6px 12px",
      marginTop: "8px",
    }),
  };

  // ID deterministik dan konsisten SSR/CSR
  const instanceId = `select-${name}`;
  const inputId = `${name}-input`;
  const labelId = `${name}-label`;

  return (
    <div>
      <label id={labelId} htmlFor={inputId} className="text-muted">
        {label}
        {isImportant && <span>*</span>}
      </label>

      <Select
        // KUNCI: set ID stabil
        instanceId={instanceId}
        inputId={inputId}
        name={name}
        aria-labelledby={labelId}
        id={name}
        options={options}
        styles={selectStyles}
        value={
          value
            ? options.find((option) => option.value.toString() === value) ??
              null
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
