import React from "react";

const CustomButton = ({ text, className }) => {
  return <button className={`${className}`}>{text}</button>;
};

export default CustomButton;
