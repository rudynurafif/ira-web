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
    {
      title: "Pesanan Diterima",
      description: "Data registrasi Anda sudah kami terima.",
    },
    {
      title: "Pesanan dalam perjalanan",
      description: "Paket Anda sedang dalam perjalanan dengan kurir",
    },
    {
      title: "Pesanan telah tiba",
      description: "Perangkat sudah sampai di alamat Anda.",
    },
  ];

  return (
    <div
      className={`${be_vietnam_pro.className} bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] max-sm:p-4 p-8`}
    >
      {/* <p className="text-sm max-sm:text-xs text-black font-medium max-sm:mb-1 mb-2">
        Estimasi Tiba
      </p>
      <p className="text-xl max-sm:text-sm text-black font-bold">
        21 April 2025
      </p> */}

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
            responsive={false}
            direction={isBelowLg ? "vertical" : "horizontal"}
          >
            {steps.map((step) => (
              <Step
                className="steps-wide"
                key={step.title}
                title={step.title}
                description={step.description}
              />
            ))}
          </Steps>
        </ConfigProvider>
      </div>

      <style jsx global>{`
        .steps-wide .ant-steps-item-content {
          max-width: none !important;
        }
        .steps-wide .ant-steps-item-description {
          max-width: 40rem !important; /* atur lebar sesuai kebutuhan */
          white-space: normal !important; /* boleh multi-line */
          word-break: break-word;
        }

        /* Allow title text to wrap */
        .ant-steps-item-title {
          white-space: normal !important;
          font-weight: bold;
          word-break: break-word; /* pecah kata kalau kepanjangan */
        }

        /* Step yang sudah dilewati (finish) */
        .ant-steps-item-finish .ant-steps-item-icon {
          background-color: #1faf38 !important;
          border-color: #1faf38 !important;
        }
        .ant-steps-item-finish .ant-steps-icon {
          color: white !important;
        }
        .ant-steps-item-finish .ant-steps-item-title {
          color: #1faf38 !important;
        }

        @media (max-width: 640px) {
          .ant-steps-item-title {
            font-size: 14px !important;
            font-weight: semibold;
            padding: 0 !important;
          }
          .ant-steps-item-description {
            font-size: 12px !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DeliveryTracking;
