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
        setFaqs(resData?.data?.result);
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
