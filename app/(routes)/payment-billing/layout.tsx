import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment & Billing - Internet Rakyat",
  description:
    "Kelola pembayaran dan tagihan Anda dengan mudah di Internet Rakyat.",
  openGraph: {
    title: "Payment & Billing - Internet Rakyat",
    description:
      "Kelola pembayaran dan tagihan Anda dengan mudah di Internet Rakyat.",
  },
};

export default function PaymentBillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      <div>{children}</div>
    </section>
  );
}
