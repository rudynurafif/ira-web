import React from "react";
import collaborationPartner from "@/public/assets/Images/Collaboration/collaboration.webp";
import Image from "next/image";

function Collaboration() {
  return (
    <div className="bg-white pt-10">
      <h1 className=" text-[20px] min-[482px]:text-[24px] sm:text-[40px] md:text-[45px]  text-center pb-5 px-3">
        Kolaborasi bersama dalam{" "}
        <span className="collaboration-section-title">
          memperluas jangkauan digital Indonesia
        </span>
      </h1>
      <Image
        src={collaborationPartner}
        alt="collaborationPartner"
        className="w-full h-fit"
      />
    </div>
  );
}

export default Collaboration;
