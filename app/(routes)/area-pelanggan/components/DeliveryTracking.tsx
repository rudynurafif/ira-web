import React from "react";
import { ConfigProvider, Steps } from "antd";
const { Step } = Steps;
import { Be_Vietnam_Pro } from "next/font/google";
import { useMediaQuery } from "@mui/material";

const be_vietnam_pro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
});

const DeliveryTracking = () => {
  const isBelowLg = useMediaQuery("(max-width:1023px)");

  const steps = [
    "Toko sedang menyiapkan pesanan",
    "Pesanan dalam perjalanan",
    "Pesanan telah tiba",
  ];

  return (
    <div
      className={`${be_vietnam_pro.className} bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] max-sm:p-4 p-8`}
    >
      <p className="text-sm max-sm:text-xs text-black font-medium max-sm:mb-1 mb-2">
        Estimasi Tiba
      </p>
      <p className="text-xl max-sm:text-sm text-black font-bold">
        21 April 2025
      </p>

      <div className="mt-8 px-20 max-sm:p-0 text-wrap">
        <ConfigProvider
          theme={{
            components: {
              Steps: {
                colorPrimary: "#005FB8",
                colorTextDescription: "#000",
              },
            },
          }}
        >
          <Steps
            current={1}
            percent={60}
            responsive={false} // kita handle manual
            direction={isBelowLg ? "vertical" : "horizontal"}
          >
            {steps.map((label) => (
              <Step key={label} title={label} />
            ))}
          </Steps>
        </ConfigProvider>
      </div>

      <style jsx global>{`
        /* Allow title text to wrap */
        .ant-steps-item-title {
          white-space: normal !important;
          word-break: break-word; /* pecah kata kalau kepanjangan */
        }

        @media (max-width: 640px) {
          .ant-steps-item-title {
            font-size: 12px !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DeliveryTracking;
