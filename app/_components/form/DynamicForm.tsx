import React from "react";

function DynamicForm({
  label,
  labelClass = "text-muted",
  name,
  type = "text",
  value,
  isImportant,
  onChange,
  error,
  ...props
}: {
  label: string;
  labelClass?: string;
  name: string;
  type?: string;
  value: string;
  isImportant: boolean;
  onChange: (value: string) => void;
  error: string;
  [key: string]: any;
}) {
  if (type === "textarea") {
    return (
      <div>
        <label htmlFor={name} className={labelClass}>
          {label}
          {isImportant && <span>*</span>}
        </label>
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`px-5 disabled:cursor-not-allowed py-3 bg-primary-spectrum rounded-xl w-full mt-2 border ${
            error ? "border-red-500" : "border-[#D5D5D5]"
          } placeholder:text-gray-400 placeholder:text-sm`}
          {...props}
        ></textarea>
        {error && <p className="text-red-500 p-0 m-0">{error}</p>}
      </div>
    );
  } else {
    return (
      <div>
        <label htmlFor={name} className={labelClass}>
          {label}
          {isImportant && <span>*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`px-5 py-3 bg-primary-spectrum rounded-xl w-full mt-2 border ${
            error ? "border-red-500" : "border-[#D5D5D5]"
          } placeholder:text-gray-400 placeholder:text-sm`}
          {...props}
        />
        {error && <p className="text-red-500 p-0 m-0">{error}</p>}
      </div>
    );
  }
}

export default DynamicForm;
