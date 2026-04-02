import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment & Billing - Internet Rakyat",
  description:
    "Kelola pembayaran dan tagihan Anda dengan mudah di Internet Rakyat.",
  openGraph: {
    title: "Payment & Billing - Internet Rakyat",
    description:
      "Kelola pembayaran dan tagihan Anda dengan mudah di Internet Rakyat.",
    // images: [
    //   {
    //     url: `${process.env.NEXT_PUBLIC_URL_OBS}/IJE-FTTH_09122024/devel/assets/og-image-1.png`,
    //     width: 1200,
    //     height: 630,
    //     alt: "Internet Rakyat",
    //   },
    //   {
    //     url: `${process.env.NEXT_PUBLIC_URL_OBS}/IJE-FTTH_09122024/devel/assets/og-image-2.png`,
    //     width: 1200,
    //     height: 630,
    //     alt: "Internet Rakyat-2",
    //   },
    // ],
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
