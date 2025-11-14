"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "1. Apa itu Internet Rakyat (IRA)?",
    answer:
      "Internet Rakyat (IRA) adalah layanan internet rumah dan bisnis yang menggunakan jaringan nirkabel tetap untuk menghadirkan koneksi cepat dan stabil tanpa perlu kabel fiber.",
  },
  {
    question: "2. Bagaimana cara kerja IRA?",
    answer:
      "Internet dikirim melalui sinyal radio dari menara pemancar ke antena penerima di rumah pelanggan, lalu diteruskan ke modem/router agar bisa digunakan di semua perangkat.",
  },
  {
    question: "3. Apakah sinyal IRA stabil saat hujan?",
    answer:
      "Cuaca ekstrem seperti hujan lebat dapat sedikit memengaruhi kualitas sinyal, namun sistem jaringan Internet Rakyat dirancang agar tetap stabil dengan perangkat dan arah antena yang tepat.",
  },
  {
    question: "4. Bagaimana cara mendaftar layanan IRA?",
    answer:
      "Cukup isi formulir di website atau hubungi tim kami. Paket CPE (Modem) akan dikirim dari outlet terdekat, ketika sudah sampai bisa langsung diaktivasi lewat website Internet Rakyat.",
  },
  {
    question: "5. Apakah tersedia berbagai pilihan paket?",
    answer:
      "Ya. Internet Rakyat menyediakan beberapa paket internet dengan durasi masa aktif berbeda sesuai kebutuhan rumah atau bisnis Anda.",
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
        <div
          key={index}
          className="mb-3 bg-white border border-gray-border px-8 py-5 rounded-xl"
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full flex justify-between items-center py-5 text-slate-800 cursor-pointer"
          >
            <span className="font-semibold">{faq.question}</span>
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
            <div className="pb-5 text-sm text-slate-800">{faq.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
