"use client";

import { getRefundPolicy } from "@/app/_api/Settings/Settings";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";

function Page() {
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [subTitle, setSubTitle] = useState("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    getRefundPolicyData();
  }, []);

  async function getRefundPolicyData() {
    try {
      const res_tnc = await getRefundPolicy();

      setTitle(res_tnc.data.result?.[0].title ?? "");
      setSubTitle(res_tnc.data.result?.[0].sub_title ?? "");
      setContent(res_tnc.data.result?.[0].content ?? "");
    } catch (err: any) {
      toastErrorFromAPI(err, "Gagal muat data Refund Policy");
    }
  }

  return (
    <div>
      <div className="pt-10 pb-10 bg-linear-to-r from-[#ba2424] to-[#ff6666]">
        <div className="container mx-auto">
          <div
            className="flex items-center gap-2 text-white mb-5 cursor-pointer px-3"
            onClick={() => router.push("/")}
          >
            <FaArrowLeft size={20} /> Kembali
          </div>
          <h1 className="text-white text-2xl md:text-4xl font-bold text-center mb-3">
            {title ?? "Refund Policy IRA"}
          </h1>
          <h2 className="text-white text-xl md:text-2xl font-bold text-center">
            {subTitle ?? "REFUND POLICY INTERNET RAKYAT (IRA)"}
          </h2>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <div dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
    </div>
  );
}

export default Page;
