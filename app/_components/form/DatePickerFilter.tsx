import React, { useRef, useState } from "react";
import { addDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaXmark } from "react-icons/fa6";
import { TbCalendarSearch } from "react-icons/tb";
import { LuSettings2 } from "react-icons/lu";

// Komponen custom button
// eslint-disable-next-line react/display-name
const CustomDateInput = React.forwardRef<
  HTMLButtonElement,
  {
    value?: string;
    onClick?: () => void;
    onDelete?: () => void;
    placeholder?: string;
  }
>(({ value, onClick, onDelete, placeholder }, ref) => (
  <div className="relative inline-flex gap-2 items-center">
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className={`inline-flex cursor-pointer text-primary items-center gap-2 py-1.5 px-3 ${
        value && "pr-8"
      } bg-white border font-semibold border-primary rounded-lg text-sm hover:bg-red-50`}
    >
      <LuSettings2 className="text-lg" color="#d7201d" />
      {value || placeholder || "Filter Tanggal"}
    </button>
    {value && (
      <FaXmark
        className="absolute ml-3 right-2 top-1/2 -translate-y-1/2 cursor-pointer text-primary hover:text-black"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        size={16}
      />
    )}
  </div>
));

function DatePickerFilter({
  onChangeDate,
  deleteDate,
  label = "Tanggal",
  startDate,
  endDate,
}: {
  onChangeDate: (val: any) => void;
  deleteDate: () => void;
  label?: string;
  startDate: any;
  endDate: any;
}) {
  return (
    <div className="z-[100]">
      <DatePicker
        selected={startDate}
        onChange={onChangeDate}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        dateFormat="dd MMM yyyy"
        maxDate={new Date()}
        popperPlacement="bottom-end"
        popperProps={{ strategy: "fixed" }}
        customInput={
          <CustomDateInput
            placeholder="Tanggal awal - akhir"
            onDelete={deleteDate}
          />
        }
        // Opsional: nonaktifkan input langsung
        // readOnly
      />
    </div>
  );
}

export default DatePickerFilter;
