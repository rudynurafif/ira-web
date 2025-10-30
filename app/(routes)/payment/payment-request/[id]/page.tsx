"use client";

import { useParams } from "next/navigation";
import React from "react";

const PaymentRequestDetail = () => {
  const params = useParams();

  const { id } = params;

  return <div>Payment Request ID: {id}</div>;
};

export default PaymentRequestDetail;
