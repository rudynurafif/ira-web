import React, { useEffect, useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa";

function DynamicForm({
  label,
  labelClass = "text-muted",
  name,
  type = "text",
  value,
  isImportant,
  onChange,
  error,
  showCopyButton = false,
  onCopy,
  datalist,
  savedOptions = [],
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
  showCopyButton?: boolean;
  datalist?: string;
  savedOptions?: string[];
  onCopy?: (value: string) => void;
  [key: string]: any;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 5000);
        onCopy?.(value);
      });
    }
  };

  if (type === "textarea") {
    return (
      <div className="relative">
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
        {showCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            disabled={copied}
            className="absolute cursor-pointer disabled:cursor-not-allowed right-3 top-12 text-gray-500 hover:text-gray-700"
            title="Salin teks"
          >
            {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
          </button>
        )}
        {error && <p className="text-red-500 p-0 m-0">{error}</p>}
      </div>
    );
  } else {
    return (
      <div className="relative">
        <label htmlFor={name} className={labelClass}>
          {label}
          {isImportant && <span>*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={value}
          list={datalist}
          onChange={(e) => onChange(e.target.value)}
          className={`px-5 py-3 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] bg-primary-spectrum rounded-xl w-full mt-2 border ${
            error ? "border-red-500" : "border-[#D5D5D5]"
          } placeholder:text-gray-400 placeholder:text-sm`}
          {...props}
        />
        {showCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            disabled={copied}
            className="absolute cursor-pointer disabled:cursor-not-allowed right-3 top-12 text-gray-500 hover:text-gray-700"
            title="Salin teks"
          >
            {copied ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaCopy className="text-primary" />
            )}
          </button>
        )}
        {error && <p className="text-red-500 p-0 m-0">{error}</p>}
        {datalist && (
          <datalist id={datalist}>
            {savedOptions.map((sn, idx) => (
              <option key={idx} value={sn} />
            ))}
          </datalist>
        )}
      </div>
    );
  }
}

export default DynamicForm;
