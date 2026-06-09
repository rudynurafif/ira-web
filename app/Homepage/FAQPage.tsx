import React, { useEffect, useState } from "react";
import Image from "next/image";

import FAQAccordion, { FAQItem } from "../_components/homepage/FAQAccordion";
import faqImage from "@/public/assets/Images/FAQ-Icon-New.png";
import faqImageMobile from "@/public/assets/Images/FAQ-Icon-New-Mobile.png";
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

      // const resData = await getFAQs(params);
      const resData = await getFAQs({});
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
    <div className="relative max-sm:pt-14 pb-16 sm:py-16 max-lg:bg-[url('/assets/Images/bg-section-3-mobile.png')] max-lg:bg-cover max-lg:bg-top max-lg:bg-no-repeat">
      <div className="container mx-auto px-5 text-black relative z-10">
        {/* Desktop */}
        <div className="max-lg:hidden grid grid-cols-2 items-center gap-5">
          <div className="col-span-1">
            <Image
              src={faqImage}
              alt="FAQ illustration"
              className="max-w-sm mx-auto"
              width={400} // ✅ Tambahkan width
              height={400} // ✅ Tambahkan height
              sizes="(max-width: 1024px) 50vw, 400px" // ✅ Optimasi sizes
              loading="lazy" // ✅ Lazy load (karena below the fold)
            />
          </div>
          <div className="col-span-1">
            <h1 className="text-3xl font-bold mb-8">
              Frequently Asked Questions (FAQ)
            </h1>
            {isLoading ? <FAQLoading /> : <FAQAccordion faqs={faqs} />}
          </div>
        </div>

        {/* Mobile */}
        <div className="max-lg:flex lg:hidden flex-col gap-10 w-full min-h-[400px]">
          <div className="flex items-center gap-4 w-full justify-end">
            <div className="w-[58%] text-right pr-2 mt-4">
              <h1 className="text-end max-lg:text-3xl font-extrabold leading-tight">
                Frequently
                <br />
                Asked
                <br />
                Questions
                <br />
                (FAQ)
              </h1>
            </div>
          </div>
          <div className="w-full relative z-10">
            {isLoading ? <FAQLoading /> : <FAQAccordion faqs={faqs} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
