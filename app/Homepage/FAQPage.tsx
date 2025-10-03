import React from "react";
import Image from "next/image";

import FAQAccordion from "../_components/homepage/FAQAccordion";
import faqImage from "@/public/assets/Images/faq-image.png";

function FAQPage() {
  return (
    <div className="bg-faq py-16">
      <div className="container mx-auto px-5 text-black">
        <div className="max-sm:hidden grid grid-cols-2 items-center gap-5">
          <div className="col-span-1">
            <Image src={faqImage} alt="faq" className="w-1/2 mx-auto" />
          </div>
          <div className="col-span-1">
            <h1 className="text-3xl font-bold mb-8">
              Frequently asked questions (FAQ)
            </h1>
            <FAQAccordion />
          </div>
        </div>

        <div className="max-sm:flex sm:hidden flex-col gap-5">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Frequently asked questions (FAQ)
          </h1>
          <Image src={faqImage} alt="faq" className="w-1/2 mx-auto" />
          <FAQAccordion />
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
