import React from "react";

const PanduanCaraBayar = () => {
  return (
    <div className="w-full">
      <picture>
        <source
          media="(min-width: 1024px)"
          srcSet="/assets/Images/panduanVA.png"
        />
        <img
          src="/assets/Images/panduanVAmobile.png"
          alt="Panduan Cara Bayar"
          className="w-full h-auto"
        />
      </picture>
    </div>
  );
};

export default PanduanCaraBayar;
