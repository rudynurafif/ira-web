import React, { useRef, useState } from "react";
import { addDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaXmark } from "react-icons/fa6";
import { TbCalendarSearch } from "react-icons/tb";

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
  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  //   const [endDate, setEndDate] = useState(addDays(new Date(), 3));

  // const onChange = (dates: any) => {
  // const [start, end] = dates;
  // setStartDate(start);
  // setEndDate(end);
  // };

  return (
    <div className="z-100">
      <label className="text-sm flex justify-end gap-2 items-center font-semibold text-secondary-3 mb-1">
        <TbCalendarSearch size={20} />
        {label}
      </label>
      <div className="flex justify-center items-center relative">
        <DatePicker
          selected={startDate}
          onChange={onChangeDate}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          rangeSeparator=" - "
          dateFormat={"dd MMM yyyy"}
          className="py-1.5 px-2.5 w-full bg-white min-w-[250px] border border-black rounded-[5px] text-sm placeholder:text-secondary-3 text-black"
          popperPlacement="bottom"
          popperProps={{ strategy: "fixed" }}
          placeholderText={`Tanggal awal - akhir`}
          maxDate={new Date()}
        />
        {startDate && (
          <FaXmark className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer" onClick={deleteDate} size={18} />
        )}
      </div>
    </div>
  );
}

export default DatePickerFilter;
