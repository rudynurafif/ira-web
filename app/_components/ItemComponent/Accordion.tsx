import { TypeAccordionFunction } from "@/app/_shared/types/project";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function Accordion({ title, children }: TypeAccordionFunction) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="">
      <button
        className="w-full flex justify-between items-center py-3 border-b border-[#C5C5C5]"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h1 className="text-base font-bold">{title}</h1>
        {/* {isOpen ? <FaChevronUp /> : <FaChevronDown />} */}
        <FaChevronDown
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-1 my-3">{children}</div>
      </div>
    </div>
  );
}

export default Accordion;
