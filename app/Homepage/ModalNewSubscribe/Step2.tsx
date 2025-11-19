// import Image from "next/image";
// import React, { useEffect, useState } from "react";

// // image
// import banner from "@/public/assets/landing/ModalRegis/banner-step-4.webp";
// import logoWA from "@/public/assets/icon/whatsapp-icon.png";
// import OtpInput from "@/app/_components/OtpInput";
// import toast from "react-hot-toast";
// import { formatTimer } from "@/app/_shared/utils";
// import { resendOTPUser, verifyOTPUser } from "@/app/_api/Auth/auth";

// function Step2({
//   creds,
//   changeStep,
// }: {
//   creds: string;
//   changeStep: (step: number) => void;
// }) {
//   const [timeLeft, setTimeLeft] = useState(60); // Timer mulai dari 60 detik
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (timeLeft <= 0) return;

//     const timerId = setInterval(() => {
//       setTimeLeft((prevTime) => prevTime - 1);
//     }, 1000);

//     // Bersihkan interval saat komponen unmount
//     return () => clearInterval(timerId);
//   }, [timeLeft]);

//   async function handleOtpSubmit(otp: string) {
//     const loading = toast.loading("Loading...");
//     try {
//       const body = {
//         // email: emailUser,
//         code: otp,
//         phone_number: creds,
//       };

//       const res_verifyOTP = await verifyOTPUser(body);

//       toast.dismiss(loading);
//       toast.success("Verifikasi OTP Berhasil.");
//       changeStep(3);

//       // if (res_verifyOTP.data.message === "Success") {
//       //   setCookie("token", res_verifyOTP.data.result, {
//       //     // buat selama 1 bulan
//       //     maxAge: 60 * 60 * 24 * 30,
//       //   });
//       //   toast.dismiss(loading);
//       //   toast.success("Login Berhasil.");
//       //   // router.push("/reminder-billing");
//       //   window.location.href = "/reminder-billing";
//       // } else {
//       //   toast.dismiss(loading);
//       //   toast.error("Login Gagal. Silahkan coba lagi");
//       // }
//     } catch (error: any) {
//       toast.dismiss(loading);
//       if (error.response.data.message.includes("not found")) {
//         toast.error("Verifikasi Gagal. Silahkan coba lagi");
//       } else if (error.response.data.message.includes("expired")) {
//         toast.error("OTP Sudah Kadaluarsa. Silahkan kirim ulang otp Anda lagi");
//       } else {
//         toast.error("Terjadi Kesalahan. Silahkan coba lagi.");
//       }
//     }
//   }

//   async function handleResendOTP() {
//     setIsLoading(true);
//     try {
//       const body = {
//         // email: emailUser,
//         // type: "register",
//         // creds: creds,
//         phone_number: creds,
//       };

//       const res_resendOTP = await resendOTPUser(body);

//       toast.success("OTP telah terkirim.");
//       setIsLoading(false);
//       setTimeLeft(60);
//     } catch (error: any) {
//       toast.success("OTP gagal terkirim. Silahkan coba lagi.");
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div>
//       <Image alt="banner-4" src={banner} />
//       <div className="px-10 pt-10 py-20 text-center">
//         <h1 className="text-[#003D76] text-2xl font-bold">
//           Verifikasi OTP telah dikirim ke nomor {creds}
//         </h1>
//         {/* <p className="text-black">
//           Jangan khawatir! Customer service kami akan segera memberikan
//           informasi untuk Anda
//         </p>
//         <p>Masukkan OTP yang sudah dikirimkan ke nomor {creds}</p> */}

//         <div className="my-7 flex justify-center w-full">
//           <div className="mx-auto">
//             <OtpInput length={6} onSubmit={handleOtpSubmit} />
//           </div>
//         </div>

//         <div className="w-full">
//           <button
//             type="button"
//             id="button-resend-otp-no-coverage"
//             disabled={timeLeft > 0 || isLoading}
//             className="disabled:cursor-not-allowed text-nowrap disabled:bg-[#C5C5C5] text-white bg-[#FF9500] py-3 px-10 rounded-xl text-sm sm:text-lg md:text-2xl font-bold mt-5"
//             onClick={handleResendOTP}
//           >
//             {timeLeft > 0
//               ? `Kirim ulang dalam ${formatTimer(timeLeft)}`
//               : "Kirim ulang"}
//           </button>
//         </div>

//         {/* <button
//           className="flex gap-1 justify-center items-center md:text-lg sm:text-base text-sm bg-[#FF9500] text-white font-bold rounded-xl py-3 px-10 mt-5 w-full"
//           onClick={() => {
//             // if (!isDragging) {
//             // Hanya buka WhatsApp jika tidak sedang dragging
//             window.open(`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_CS}`, "_blank"); // Ganti nomor sesuai kebutuhan
//             // }
//           }}
//         >
//           Hubungi via Whatsapp
//           <Image alt="whatsapp-icon" src={logoWA} />
//         </button> */}
//       </div>
//     </div>
//   );
// }

// export default Step2;
