"use client";

import { getFAQs } from "@/app/_api/Settings/Settings";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import FAQLoading from "./_components/FAQLoading";

type FAQItem = {
  title: string;
  description: string;
};

const faqsBackUp: FAQItem[] = [
  {
    title: "Apa itu Internet Rakyat (IRA)?",
    description:
      "Internet Rakyat (IRA) adalah layanan internet rumah dan bisnis yang menggunakan jaringan nirkabel tetap untuk menghadirkan koneksi cepat dan stabil tanpa perlu kabel fiber.",
  },
  {
    title: "Bagaimana cara kerja IRA?",
    description:
      "Internet dikirim melalui sinyal radio dari menara pemancar ke antena penerima di rumah pelanggan, lalu diteruskan ke modem/router agar bisa digunakan di semua perangkat.",
  },
  {
    title: "Apakah sinyal IRA stabil saat hujan?",
    description:
      "Cuaca ekstrem seperti hujan lebat dapat sedikit memengaruhi kualitas sinyal, namun sistem jaringan Internet Rakyat dirancang agar tetap stabil dengan perangkat dan arah antena yang tepat.",
  },
  {
    title: "Bagaimana cara mendaftar layanan IRA?",
    description:
      "Cukup isi formulir di website atau hubungi tim kami. Paket CPE (Modem) akan dikirim dari outlet terdekat, ketika sudah sampai bisa langsung diaktivasi lewat website Internet Rakyat.",
  },
  {
    title: "Apakah tersedia berbagai pilihan paket?",
    description:
      "Ya. Internet Rakyat menyediakan beberapa paket internet dengan durasi masa aktif berbeda sesuai kebutuhan rumah atau bisnis Anda.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const params = {
        category: "TESTING",
      };

      const resData = await getFAQs(params);

      if (resData?.data?.statusCode === 200) {
        setFaqs(resData?.data?.result ?? faqsBackUp);
      }
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (isLoading) return <FAQLoading />;

  return (
    <div className="w-full">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="mb-3 bg-white border border-gray-border px-8 py-5 rounded-xl"
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full flex justify-between gap-4 items-center text-slate-800 cursor-pointer"
          >
            <span className="font-semibold text-start">
              {`${index + 1}. ${faq.title}`}
            </span>
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
            <div className="text-sm pt-2">
              <div dangerouslySetInnerHTML={{ __html: faq.description }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
