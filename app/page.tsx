"use client";
import FAQPage from "./Homepage/FAQPage";
import MainPage from "./Homepage/MainPage";
import PackagePage from "./Homepage/PackagePage";
import WhyFWAPage from "./Homepage/WhyFWAPage";

export default function Home() {
  return (
    <div>
      <MainPage />
      <WhyFWAPage />
      <PackagePage />
      <FAQPage />
    </div>
  );
}
