import React from "react";
import iconSpeed from "@/public/assets/icon/icon_speed.svg";
import iconWifi from "@/public/assets/icon/icon_wifi.svg";
import iconFiber from "@/public/assets/icon/icon_fiber.svg";
import iconWireless from "@/public/assets/icon/icon_wireless.svg";
import Image from "next/image";

function Benefits() {
  const section = [
    {
      icon: iconWireless,
      text: "Wireless Home Network",
    },
    {
      icon: iconSpeed,
      text: "High speed internet",
    },
    {
      icon: iconWifi,
      text: "Stable Internet Connection",
    },
    {
      icon: iconFiber,
      text: "Pure Fiber Network",
    },
  ];

  return (
    <div className="bg-bluebold flex justify-center">
      <div className="max-w-[1920px] w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-10 px-[5%] min-[1261px]:px-[10%]">
          {section.map((data, index) => (
            <div key={index} className="lg:flex lg:justify-center">
              <div className="flex flex-col  max-lg:items-center">
                <div className="pb-3">
                  <Image src={data.icon} alt={data.text} />
                </div>
                <div className="text-base sm:text-[20px] text-white font-bold max-lg:text-center">
                  {data.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Benefits;
