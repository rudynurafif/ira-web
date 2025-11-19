// import React, { useEffect, useState } from "react";
// import Step1 from "./ModalNewSubscribe/Step1";
// import Step2 from "./ModalNewSubscribe/Step2";
// import Step3 from "./ModalNewSubscribe/Step3";
// import { useSearchParams } from "next/navigation";
// import toast from "react-hot-toast";
// // import { createReffCode } from "../_api/Auth/auth";
// // import { v4 as uuidv4 } from "uuid";

// function ModalNewSubscribe({ closeModal }: { closeModal: () => void }) {
//   const searchParams = useSearchParams();
//   const [stepRegister, setStepRegister] = useState(1);

//   const [creds, setCreds] = useState<string>("");

//   // data pelanggan
//   const [browserId, setBrowserId] = useState<any>(null);
//   const [userAgent, setUserAgent] = useState<any>(null);
//   const [ip, setIp] = useState("");

//   function getBrowserName(userAgent: string) {
//     if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
//       return "Chrome";
//     } else if (userAgent.includes("Firefox")) {
//       return "Firefox";
//     } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
//       return "Safari";
//     } else if (userAgent.includes("Edg")) {
//       return "Edge";
//     } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
//       return "Opera";
//     } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
//       return "Internet Explorer";
//     } else {
//       return "Unknown";
//     }
//   }

//   useEffect(() => {
//     const ref_code = searchParams.get("refcode");
//     if (ref_code) {
//       fetch("https://api.ipify.org?format=json")
//         .then((res) => res.json())
//         .then((data) => {
//           let params: any = {};

//           params.ref_code = ref_code;

//           const localStorageBrowserId = localStorage.getItem("browserId");

//           // Get the client's fingerprint id
//           if (localStorageBrowserId) {
//             params.browser_id = localStorageBrowserId;
//             setBrowserId(localStorageBrowserId);
//           } else {
//             // const tempBrowserId = uuidv4();
//             // params.browser_id = tempBrowserId;
//             // localStorage.setItem("browserId", tempBrowserId);
//             // setBrowserId(tempBrowserId);
//           }

//           // Get the client's user agent
//           params.user_agent = navigator.userAgent;

//           // Get the client's Browser
//           params.browser = getBrowserName(navigator.userAgent);

//           // Get the client's OS
//           params.platform = navigator.platform;

//           // Get the client's IP
//           params.ip_address = data.ip;

//           sendRefCode(params);
//         })
//         .catch((err) => {
//           toast.error(
//             "Terjadi kesalahan pada referal code. Silahkan coba lagi."
//           );
//         });

//       // Print the 32bit hash id to the console
//     }
//   }, []);

//   async function sendRefCode(body: any) {
//     try {
//       // const res_sendRefCode = await createReffCode(body);
//     } catch (error: any) {
//       toast.error("Terjadi kesalahan pada referal code. Silahkan coba lagi.");
//     }
//   }

//   function changeStep(step: number) {
//     setStepRegister(step);
//   }

//   return (
//     <div>
//       {stepRegister === 1 && (
//         <Step1
//           closeModal={closeModal}
//           changeStep={(step: number) => changeStep(step)}
//           setCreds={(creds: string) => setCreds(creds)}
//           browserId={browserId}
//         />
//       )}
//       {stepRegister === 2 && (
//         <Step2 creds={creds} changeStep={(step: number) => changeStep(step)} />
//       )}
//       {stepRegister === 3 && <Step3 closeModal={closeModal} />}
//     </div>
//   );
// }

// export default ModalNewSubscribe;
