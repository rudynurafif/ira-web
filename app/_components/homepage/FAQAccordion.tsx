"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is Material Tailwind?",
    answer:
      "Material Tailwind is a framework that enhances Tailwind CSS with additional styles and components.",
  },
  {
    question: "How to use Material Tailwind?",
    answer:
      "You can use Material Tailwind by importing its components into your Tailwind CSS project.",
  },
  {
    question: "What can I do with Material Tailwind?",
    answer:
      "Material Tailwind allows you to quickly build modern, responsive websites with a focus on design.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full ">
      {faqs.map((faq, index) => (
        <div key={index} className="mb-3 bg-[#EEF4FC] px-8 py-5 rounded-xl">
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full flex justify-between items-center py-5 text-slate-800 cursor-pointer"
          >
            <span>{faq.question}</span>
            <span
              className={`transition-transform duration-300 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            >
              <FaChevronDown />
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? "max-h-40" : "max-h-0"
            }`}
          >
            <div className="pb-5 text-sm text-slate-500">{faq.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
