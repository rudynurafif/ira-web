import React from "react";
import { ConfigProvider, Steps } from "antd";
const { Step } = Steps;
import { Be_Vietnam_Pro } from "next/font/google";

const be_vietnam_pro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
});

const DeliveryTracking = () => {
  const steps = [
    "Toko sedang menyiapkan pesanan",
    "Pesanan dalam perjalanan",
    "Pesanan telah tiba",
  ];

  return (
    <div
      className={`${be_vietnam_pro.className} bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-8`}
    >
      <p className="text-sm text-black font-medium mb-2">Estimasi Tiba</p>
      <p className="text-xl text-black font-bold">21 April 2025</p>

      <div className="mt-8 px-20">
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
          <Steps current={1} percent={60}>
            {steps.map((label) => (
              <Step key={label} title={label} />
            ))}
          </Steps>
        </ConfigProvider>
      </div>
    </div>
  );
};

export default DeliveryTracking;
