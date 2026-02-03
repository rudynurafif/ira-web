export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const CUSTOMER_URL = "/app/customer";
// export const PRODUCTS_URL = "/app/products";
// export const ORDERS_URL = "/app/orders";
// export const PAYPAL_URL = "/app/config/paypal";
// export const UPLOAD_URL = "/app/upload";

import {
  bjb,
  bni,
  bri,
  bsi,
  cimb,
  dana,
  gopay,
  indomaret,
  mandiri,
  ovo,
  permata,
  qris,
} from "@/public/assets/Images/bank";
import { PackageData } from "../types/customer-area";
import { FAQItem } from "@/app/_components/homepage/FAQAccordion";

export const packageList: any = [
  {
    id: 1,
    name: "IRA 7 Hari [UNLIMITED]",
    price: 37500,
    period: 7,
    benefit: [
      "Kuota Unlimited",
      "Sudah termasuk pajak",
      "Benefit 3",
      "Benefit 4",
    ],
    color: "#02EFFE",
  },
  {
    id: 2,
    name: "IRA 14 Hari [UNLIMITED]",
    price: 65000,
    period: 14,
    benefit: [
      "Kuota Unlimited",
      "Sudah termasuk pajak",
      "Benefit 3",
      "Benefit 4",
    ],
    color: "#EAAFFF",
  },
  {
    id: 3,
    name: "IRA 30 Hari [UNLIMITED]",
    price: 100000,
    period: 30,
    benefit: [
      "Kuota Unlimited",
      "Sudah termasuk pajak",
      "Benefit 3",
      "Benefit 4",
    ],
    color: "#675DFF",
  },
];

export const paymentList: any = [
  {
    id: 1,
    name: "Virtual Account",
    bankList: [
      {
        id: 1,
        name: "BNI",
        icon: bni,
      },
      {
        id: 2,
        name: "BJB",
        icon: bjb,
      },
      {
        id: 3,
        name: "BRI",
        icon: bri,
      },
      {
        id: 4,
        name: "BSI",
        icon: bsi,
      },
      {
        id: 5,
        name: "CIMB",
        icon: cimb,
      },
      {
        id: 6,
        name: "Mandiri",
        icon: mandiri,
      },
      {
        id: 7,
        name: "Permata",
        icon: permata,
      },
    ],
  },
  {
    id: 2,
    name: "QRIS",
    bankList: [
      {
        id: 1,
        name: "QRIS",
        icon: qris,
      },
      {
        id: 2,
        name: "Gopay",
        icon: gopay,
      },
    ],
  },
  {
    id: 3,
    name: "E-Wallet",
    bankList: [
      {
        id: 1,
        name: "Dana",
        icon: dana,
      },
      {
        id: 2,
        name: "OVO",
        icon: ovo,
      },
    ],
  },
  {
    id: 4,
    name: "Outlet",
    bankList: [
      {
        id: 1,
        name: "Indomaret",
        icon: indomaret,
      },
    ],
  },
];

export const content_terms = [
  {
    id: 1,
    title: "Umum",
    description: [
      `Syarat dan Ketentuan ini ("Syarat") mengatur penyediaan layanan internet ("Layanan") oleh Internet Rakyat kepada pelanggan ("Pelanggan").`,
      `Dengan berlangganan Layanan, Pelanggan dianggap telah menyetujui Syarat ini.`,
      `Internet Rakyat berhak mengubah Syarat ini kapan saja, dan perubahan tersebut akan berlaku setelah dipublikasikan di situs resmi.`,
    ],
  },
  {
    id: 2,
    title: "Layanan",
    description: [
      `Internet Rakyat menyediakan konektivitas internet dengan kecepatan sesuai paket yang dipilih. Kecepatan aktual dapat bervariasi tergantung kondisi jaringan, kemampuan perangkat, dan faktor eksternal lainnya.`,
      `Layanan ditawarkan sebagai paket "Unlimited" tanpa pembatasan Kebijakan Penggunaan Wajar (FUP).`,
      `Internet Rakyat berhak melakukan pemeliharaan jaringan yang mungkin berdampak sementara pada Layanan. Pelanggan akan diberi tahu sebelumnya jika memungkinkan.`,
    ],
  },
  {
    id: 3,
    title: "Berlangganan dan Pembayaran",
    description: [
      `Biaya berlanggan untuk Layanan adalah Rp. 100.000 per bulan dan atau 250.000 per bulan, termasuk pajak yang berlaku.`,
      `Pelanggan akan mendapatkan gratis bulan pertama untuk siklus penagihan awal.`,
      `Internet Rakyat menawarkan bulan pertama gratis untuk Pelanggan baru. Promosi ini tidak dapat dipindahtangankan dan hanya berlaku untuk siklus penagihan pertama.`,
      `Pembayaran dapat dilakukan melalui metode yang tercantum di situs resmi atau saluran pembayaran resmi.`,
    ],
  },
  {
    id: 4,
    title: "Instalasi dan Peralatan",
    description: [
      `Instalasi disediakan secara gratis oleh Internet Rakyat.`,
      `Pelanggan akan diberikan modem yang biayanya sudah termasuk dalam biaya berlangganan. Modem tetap menjadi milik Internet Rakyat.`,
      `Pelanggan harus memastikan modem dikembalikan dalam kondisi baik setelah penghentian Layanan. Biaya dapat dikenakan untuk peralatan yang hilang atau rusak.`,
    ],
  },
  {
    id: 5,
    title: "Tanggung Jawab Pelanggan",
    description: [
      `Pelanggan setuju untuk menggunakan Layanan secara bertanggung jawab dan sesuai dengan hukum dan peraturan yang berlaku.`,
      `Pelanggan tidak boleh menggunakan Layanan untuk kegiatan ilegal, termasuk namun tidak terbatas pada spam, peretasan, atau distribusi perangkat lunak berbahaya.`,
      `Pelanggan bertanggung jawab atas keamanan perangkat dan koneksi jaringannya sendiri.`,
    ],
  },
  {
    id: 6,
    title: "Penghentian",
    description: [
      `Pelanggan dapat menghentikan langganan dengan memberikan pemberitahuan tertulis setidaknya 30 hari kepada Internet Rakyat.`,
      // `Layanan ditawarkan sebagai paket "Unlimited" tanpa pembatasan Kebijakan Penggunaan Wajar (FUP).`,
      `Setelah penghentian, Pelanggan harus menyelesaikan pembayaran yang tertunda dan mengembalikan peralatan milik Internet Rakyat.`,
    ],
  },
  {
    id: 7,
    title: "Tanggung Jawab",
    description: [
      `Internet Rakyat tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan Layanan.`,
      `Tanggung jawab Internet Rakyat terbatas pada jumlah yang dibayarkan oleh Pelanggan untuk siklus penagihan saat ini.`,
    ],
  },
  {
    id: 8,
    title: "Hukum Yang Berlaku",
    description: [
      `Syarat ini diatur oleh hukum Republik Indonesia.`,
      `Sengketa yang timbul dari Syarat ini akan diselesaikan melalui mediasi. Jika mediasi gagal, sengketa akan diselesaikan di pengadilan negeri yang berwenang di Indonesia.`,
    ],
  },
];

export const listConnectedDevices = [
  {
    id: 1,
    name: "Iphone 16",
    ip: "192.168.1.23",
    mac: "80:ab:2c:19:aa:12",
    lastSeen: "1:30:25 PM",
    isBlocked: false,
  },
  {
    id: 2,
    name: "Samsung S25 Ultra",
    ip: "192.168.1.44",
    mac: "90:ab:2c:19:aa:12",
    lastSeen: "1:23:34 PM",
    isBlocked: true,
  },
  {
    id: 3,
    name: "Macbook Pro",
    ip: "192.168.1.51",
    mac: "32:ab:2c:19:aa:12",
    lastSeen: "2:34:09 PM",
    isBlocked: false,
  },
];

export const hardcodedPackages: PackageData[] = [
  {
    id: "0a9a2758-3b63-4855-95d2-0d3cde62fe3a",
    name: "Paket IRA Unlimited 1 Bulan",
    speed_mbps: "100",
    quota_mb: "0",
    discount_price: "0",
    price: 100000,
    treshold_isolate_days: 10,
    description: "",
    remarks: "",
    duration: 30,
    is_active: true,
    appear_on: "customer",
    package_type: "regular",
    eligible_payment_before_days: 0,
    bts_package_id: [],
  },
  {
    id: "ae26f8a5-d8cf-4fa8-b4fa-9c79a401cbfb",
    name: "Tahun Baru Paket Baru",
    speed_mbps: "476",
    quota_mb: "0",
    discount_price: "0",
    price: 5000,
    treshold_isolate_days: 0,
    description: "Paket spesial tahun baru",
    remarks: "",
    duration: 1,
    is_active: true,
    appear_on: "global",
    package_type: "regular",
    eligible_payment_before_days: null,
    bts_package_id: [],
  },
  {
    id: "4e89227d-d04c-4290-8391-c07bd0714cbe",
    name: "Test Paket Global",
    speed_mbps: "100",
    quota_mb: "0",
    discount_price: "0",
    price: 100000,
    treshold_isolate_days: 30,
    description: "",
    remarks: "",
    duration: 30,
    is_active: true,
    appear_on: "global",
    package_type: "regular",
    eligible_payment_before_days: null,
    bts_package_id: [],
  },
];

const faqsBackUp: FAQItem[] = [
  {
    title: "Apa itu Internet Rakyat (IRA)?",
    description:
      "Internet Rakyat (IRA) adalah layanan internet rumah dan bisnis yang menggunakan jaringan nirkabel tetap untuk menghadirkan koneksi cepat dan stabil tanpa perlu kabel fiber.",
  },
  {
    title: "Bagaimana cara kerja IRA?",
    description:
      "Internet dikirim melalui sinyal radio dari menara pemancar ke antena penerima di rumah pelanggan, lalu diteruskan ke modem/router agar bisa digunakan di semua perangkat.",
  },
  {
    title: "Apakah sinyal IRA stabil saat hujan?",
    description:
      "Cuaca ekstrem seperti hujan lebat dapat sedikit memengaruhi kualitas sinyal, namun sistem jaringan Internet Rakyat dirancang agar tetap stabil dengan perangkat dan arah antena yang tepat.",
  },
  {
    title: "Bagaimana cara mendaftar layanan IRA?",
    description:
      "Calon Pelanggan Bisa Melakukan Pendaftaran Mandiri Via Aplikasi/Website atau Melalui Sales Resmi IRA Di Area Pelanggan.",
  },
  {
    title: "Apakah tersedia berbagai pilihan paket?",
    description:
      "Ya. Internet Rakyat menyediakan beberapa paket internet dengan durasi masa aktif berbeda sesuai kebutuhan rumah atau bisnis Anda.",
  },
];
