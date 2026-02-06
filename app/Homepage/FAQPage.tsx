import React, { useEffect, useState } from "react";
import Image from "next/image";

import FAQAccordion, { FAQItem } from "../_components/homepage/FAQAccordion";
import faqImage from "@/public/assets/Images/faq-image.png";
import { getFAQs } from "../_api/Settings/Settings";
import { toastErrorFromAPI } from "../_shared/utils";
import FAQLoading from "../_components/homepage/_components/FAQLoading";

function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const params = {
        category: "Informasi Umum",
      };

      const resData = await getFAQs(params);
      // const resData = await getFAQs({});
      const result = resData?.data?.result;

      if (Array.isArray(result) && result.length > 0) {
        setFaqs(result);
      } else {
        setFaqs([]);
      }
    } catch (err: any) {
      toastErrorFromAPI(err);
      setFaqs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="relative bg-faq py-16">
      <div className="container mx-auto px-5 text-black">
        <div className="max-sm:hidden grid grid-cols-2 items-center gap-5">
          <div className="col-span-1">
            <Image src={faqImage} alt="faq" className="w-full mx-auto" />
          </div>
          <div className="col-span-1">
            <h1 className="text-3xl font-bold mb-8">
              Frequently Asked Questions (FAQ)
            </h1>
            {isLoading ? <FAQLoading /> : <FAQAccordion faqs={faqs} />}
          </div>
        </div>

        <div className="max-sm:flex sm:hidden flex-col gap-5">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Frequently Asked Questions (FAQ)
          </h1>
          <Image src={faqImage} alt="faq" className="sm:w-1/2 mx-auto" />
          {isLoading ? <FAQLoading /> : <FAQAccordion faqs={faqs} />}
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
