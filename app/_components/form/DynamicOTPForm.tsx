"use client";

import { useState } from "react";
import { OTPInput, SlotProps } from "input-otp";

interface GroupedOTPProps {
  label: string;
  name: string;
  isImportant: boolean;
  length?: number; // default 6
  onComplete?: (val: string) => void;
  onChange?: (val: string) => void;
  isInvalid?: boolean; // ← tambah ini
  isDisabled?: boolean;
  classNameStyle?: string;
}

export default function GroupedOTP({
  label,
  name,
  isImportant,
  length = 6,
  onComplete,
  onChange,
  isInvalid = false,
  isDisabled,
  classNameStyle,
}: GroupedOTPProps) {
  const [otp, setOtp] = useState("");

  return (
    <div>
      <label htmlFor={name} className="text-muted">
        {label}
        {isImportant && <span>*</span>}
      </label>
      <div className={`${classNameStyle}`}>
        <OTPInput
          maxLength={length}
          value={otp}
          onChange={(val) => {
            if (isDisabled) return;
            setOtp(val);
            onChange?.(val);
          }}
          onPaste={(e) => {
            if (isDisabled) return;
            const pasted = e.clipboardData
              .getData("text")
              .replace(/\s+/g, "")
              .slice(0, length);
            setOtp(pasted);
            onChange?.(pasted);
            if (pasted.length === length) {
              onComplete?.(pasted);
            }
            e.preventDefault(); // mencegah perilaku default
          }}
          onComplete={(val) => !isDisabled && onComplete?.(val)}
          containerClassName="group flex items-center mt-2"
          render={({ slots }) => (
            <>
              <div className={`flex gap-1 `}>
                {slots.slice(0, length / 2).map((slot, idx) => (
                  <Slot
                    key={idx}
                    {...slot}
                    isInvalid={isInvalid}
                    isDisabled={isDisabled}
                  />
                ))}
              </div>

              <FakeDash />

              <div className="flex gap-1">
                {slots.slice(length / 2).map((slot, idx) => (
                  <Slot
                    key={idx + length / 2}
                    {...slot}
                    isInvalid={isInvalid}
                    isDisabled={isDisabled}
                  />
                ))}
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}

function Slot(
  props: SlotProps & { isInvalid?: boolean; isDisabled?: boolean }
) {
  return (
    <div
      className={`relative w-[50px] h-[50px] text-base flex items-center justify-center 
        transition-all duration-300 bg-[#F7F9FD]
        border rounded-[12px]
        ${props.isInvalid ? "border-red-500" : "border-gray-300"}
        ${
          props.isDisabled
            ? "cursor-not-allowed"
            : "group-hover:border-gray-400 group-focus-within:border-gray-400"
        }
        outline-0 outline-blue-300 
        ${props.isActive ? "outline-2 outline-blue-500" : ""}
      `}
    >
      <div className="group-has-[input[data-input-otp-placeholder-shown]]:opacity-20">
        {props.char ?? props.placeholderChar}
      </div>
      {props.hasFakeCaret && !props.isDisabled && <FakeCaret />}
    </div>
  );
}

function FakeCaret() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-caret-blink">
      <div className="w-px h-5 bg-black" />
    </div>
  );
}

function FakeDash() {
  return (
    <div className="flex w-10 justify-center items-center">
      <div className="w-3 h-[2px] rounded-full bg-gray-300" />
    </div>
  );
}
