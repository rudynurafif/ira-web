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
  onFocus?: () => void;
  isInvalid?: boolean; // ← tambah ini
  isDisabled?: boolean;
  classNameStyle?: string;
  value?: string;
}

export default function GroupedOTP({
  label,
  name,
  isImportant,
  length = 6,
  onComplete,
  onChange,
  onFocus,
  isInvalid = false,
  isDisabled,
  classNameStyle,
  value = "",
}: GroupedOTPProps) {
  const [otp, setOtp] = useState(value);

  return (
    <div>
      <label htmlFor={name} className="text-muted">
        {label}
        {isImportant && <span>*</span>}
      </label>
      <div className={`${classNameStyle}`}>
        <OTPInput
          maxLength={length}
          value={value}
          onChange={(val) => {
            if (isDisabled) return;
            setOtp(val);
            onChange?.(val);
          }}
          // onPaste={(e) => {
          //   if (isDisabled) return;
          //   const pasted = e.clipboardData
          //     .getData("text")
          //     .replace(/\s+/g, "")
          //     .slice(0, length);
          //   setOtp(pasted);
          //   onChange?.(pasted);
          //   if (pasted.length === length) {
          //     onComplete?.(pasted);
          //   }
          //   e.preventDefault(); // mencegah perilaku default
          // }}
          onComplete={(val) => !isDisabled && onComplete?.(val)}
          containerClassName="group flex items-center mt-2"
          render={({ slots }) => (
            <>
              <div className="flex flex-row items-center">
                <div className="flex gap-1">
                  {slots.slice(0, length / 2).map((slot, idx) => (
                    <Slot
                      key={idx}
                      {...slot}
                      isInvalid={isInvalid}
                      isDisabled={isDisabled}
                    />
                  ))}
                </div>

                <div className="">
                  <FakeDash />
                </div>

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
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}

function Slot(
  props: SlotProps & { isInvalid?: boolean; isDisabled?: boolean },
) {
  return (
    <div
      className={`relative w-8 h-8 [400px]:w-9 [400px]:h-9 sm:w-12.5 sm:h-12.5 text-base flex items-center justify-center 
        transition-all duration-300 
        border rounded-xl
        ${props.isInvalid ? "border-red-500" : "border-gray-300"}
        ${
          props.isDisabled
            ? "cursor-not-allowed! bg-background-customer"
            : "group-hover:border-gray-400 bg-[#F7F9FD] group-focus-within:border-gray-400"
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
