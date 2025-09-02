import { ReactSelectType } from "@/app/_shared/types/form";
import React from "react";
import Select, { StylesConfig } from "react-select";

function DynamicSelectForm({
  label,
  name,
  isImportant,
  options,
  value,
  onChange,
  error,
  ...props
}: {
  label: string;
  name: string;
  isImportant: boolean;
  options: ReactSelectType[];
  value: string;
  onChange: (value: ReactSelectType | null) => void;
  error: string;
  [key: string]: any;
}) {
  const selectStyles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      backgroundColor: "#F7F9FD",
      borderRadius: "12px",
      border: `1px solid ${error ? "#FF0000" : "#D5D5D5"}`,
      padding: "6px 12px 6px 12px",
      marginTop: "8px",
    }),
  };

  return (
    <div>
      <label htmlFor={name} className="text-muted">
        {label}
        {isImportant && <span>*</span>}
      </label>
      <Select
        options={options}
        styles={selectStyles}
        id={name}
        value={
          value
            ? options.find((option) => option.value.toString() === value)
            : null
        }
        onChange={(e: any) => {
          onChange(e);
        }}
        {...props}
      />
    </div>
  );
}

export default DynamicSelectForm;
