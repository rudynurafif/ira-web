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
    name: "-",
    ip: "-",
    mac: "-",
    lastSeen: "-",
    isBlocked: false,
  },
  {
    id: 2,
    name: "-",
    ip: "-",
    mac: "-",
    lastSeen: "-",
    isBlocked: true,
  },
  {
    id: 3,
    name: "-",
    ip: "-",
    mac: "-",
    lastSeen: "-",
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

export const allItems = [
  {
    id: 1,
    type: "baru",
    category: "notifikasi",
    icon: "bell",
    title: "Selamat! Paket Internet Kamu Berhasil Dipasang",
    date: "Senin, 2 Jan 2026 | 14:09",
    content:
      "Paket internet Anda telah berhasil diaktifkan. Nikmati koneksi cepat dan stabil dari IRA. Jika ada kendala, hubungi tim support kami.",
  },
  {
    id: 2,
    type: "baru",
    category: "informasi",
    icon: "document",
    title: "Update Aplikasi IRA Terbaru Versi 02.01",
    date: "Senin, 2 Jan 2026 | 10:30",
    content:
      "Kami telah merilis pembaruan aplikasi IRA versi 02.01 dengan fitur baru: cek sinyal real-time, riwayat pembayaran, dan manajemen perangkat. Segera update di Play Store atau App Store!",
  },
  {
    id: 3,
    type: "normal",
    category: "notifikasi",
    icon: "bell",
    title: "Paket Internet Kamu Berhasil Diperpanjang",
    date: "Minggu, 1 Jan 2026 | 09:15",
    content:
      "Langganan Anda telah diperpanjang hingga 1 Februari 2026. Terima kasih atas kepercayaan Anda!",
  },
  {
    id: 4,
    type: "normal",
    category: "informasi",
    icon: "document",
    title: "Perubahan Jadwal Maintenance Jaringan",
    date: "Sabtu, 31 Des 2025 | 16:45",
    content:
      "Maintenance jaringan yang semula dijadwalkan 1 Januari 2026 pukul 02.00–04.00 WIB dimajukan menjadi 31 Desember 2025 pukul 23.00–01.00 WIB.",
  },
  {
    id: 5,
    type: "baru",
    category: "notifikasi",
    icon: "bell",
    title: "Pembayaran Berhasil – Langganan Aktif",
    date: "Jumat, 30 Des 2025 | 18:22",
    content:
      "Terima kasih! Pembayaran Anda sebesar Rp299.000 telah kami terima. Paket internet Anda aktif hingga 30 Januari 2026.",
  },
  {
    id: 6,
    type: "normal",
    category: "informasi",
    icon: "document",
    title: "Promo Akhir Tahun: Gratis 1 Bulan!",
    date: "Kamis, 29 Des 2025 | 11:00",
    content:
      "Rayakan akhir tahun bersama IRA! Berlangganan paket 3 bulan, dapatkan gratis 1 bulan tambahan. Promo berlaku hingga 31 Desember 2025.",
  },
  {
    id: 7,
    type: "normal",
    category: "notifikasi",
    icon: "bell",
    title: "Modem Anda Telah Di-reset Jarak Jauh",
    date: "Rabu, 28 Des 2025 | 14:30",
    content:
      "Tim teknis telah melakukan reset jarak jauh pada modem Anda untuk memperbaiki koneksi. Silakan restart perangkat Anda.",
  },
  {
    id: 8,
    type: "baru",
    category: "informasi",
    icon: "document",
    title: "Fitur Baru: Cek Kualitas Sinyal Real-Time",
    date: "Selasa, 27 Des 2025 | 09:45",
    content:
      "Kini Anda bisa memantau kekuatan sinyal secara real-time langsung dari aplikasi IRA. Buka menu 'Informasi Perangkat' untuk mencoba.",
  },
  {
    id: 9,
    type: "normal",
    category: "notifikasi",
    icon: "bell",
    title: "Tagihan Bulan Ini Telah Dikirim",
    date: "Senin, 26 Des 2025 | 08:00",
    content:
      "Tagihan langganan bulan Januari 2026 telah dikirim ke email Anda. Jumlah: Rp299.000. Batas pembayaran: 5 Januari 2026.",
  },
  {
    id: 10,
    type: "normal",
    category: "informasi",
    icon: "document",
    title: "Lokasi Kantor Pelayanan Terdekat",
    date: "Minggu, 25 Des 2025 | 13:20",
    content:
      "Kunjungi kantor pelayanan IRA terdekat di Mall Central Park Lantai 2, buka setiap hari pukul 09.00–20.00 WIB.",
  },
  {
    id: 11,
    type: "baru",
    category: "notifikasi",
    icon: "bell",
    title: "Akun Anda Telah Diverifikasi",
    date: "Sabtu, 24 Des 2025 | 16:10",
    content:
      "Verifikasi akun Anda berhasil. Sekarang Anda bisa mengakses semua fitur premium di aplikasi IRA.",
  },
  {
    id: 12,
    type: "normal",
    category: "informasi",
    icon: "document",
    title: "Tips: Optimalkan Sinyal WiFi di Rumah",
    date: "Jumat, 23 Des 2025 | 10:05",
    content:
      "Letakkan modem di tempat terbuka, hindari dekat microwave atau dinding tebal. Gunakan fitur 'Scan Sinyal' di aplikasi untuk posisi terbaik.",
  },
  {
    id: 13,
    type: "normal",
    category: "notifikasi",
    icon: "bell",
    title: "Perangkat Baru Terhubung ke Jaringan",
    date: "Kamis, 22 Des 2025 | 19:33",
    content:
      "Perangkat 'Samsung Galaxy S24' telah terhubung ke jaringan WiFi Anda. Jika ini bukan Anda, segera ganti password WiFi.",
  },
  {
    id: 14,
    type: "baru",
    category: "informasi",
    icon: "document",
    title: "Laporan Penggunaan Data Bulanan",
    date: "Rabu, 21 Des 2025 | 08:15",
    content:
      "Anda telah menggunakan 85% kuota data bulanan. Estimasi habis: 28 Desember 2025. Upgrade paket untuk kuota tak terbatas!",
  },
  {
    id: 15,
    type: "normal",
    category: "notifikasi",
    icon: "bell",
    title: "Pengingat: Jadwal Teknisi Besok",
    date: "Selasa, 20 Des 2025 | 14:00",
    content:
      "Teknisi akan datang ke rumah Anda pada Rabu, 21 Desember 2025 pukul 10.00–12.00 WIB untuk instalasi ulang modem.",
  },
  {
    id: 16,
    type: "normal",
    category: "informasi",
    icon: "document",
    title: "Kebijakan Privasi Diperbarui",
    date: "Senin, 19 Des 2025 | 11:30",
    content:
      "Kami telah memperbarui Kebijakan Privasi untuk meningkatkan transparansi. Baca selengkapnya di halaman Profil > Pengaturan.",
  },
  {
    id: 17,
    type: "baru",
    category: "notifikasi",
    icon: "bell",
    title: "Bonus Kuota 5 GB – Terima Kasih!",
    date: "Minggu, 18 Des 2025 | 20:45",
    content:
      "Sebagai apresiasi atas loyalitas Anda, kami memberikan bonus kuota 5 GB yang berlaku hingga 31 Desember 2025.",
  },
  {
    id: 18,
    type: "normal",
    category: "informasi",
    icon: "document",
    title: "Jadwal Libur Nasional & Dampak Layanan",
    date: "Sabtu, 17 Des 2025 | 09:00",
    content:
      "Selama libur Natal & Tahun Baru (24 Des–2 Jan), layanan pelanggan tetap aktif 24/7 via chat aplikasi. Kunjungan teknisi hanya darurat.",
  },
  {
    id: 19,
    type: "normal",
    category: "notifikasi",
    icon: "bell",
    title: "Email Verifikasi Telah Dikirim",
    date: "Jumat, 16 Des 2025 | 15:22",
    content:
      "Kami telah mengirim email verifikasi ke rudy4@mail.com. Klik tautan dalam email untuk menyelesaikan verifikasi.",
  },
  {
    id: 20,
    type: "baru",
    category: "informasi",
    icon: "document",
    title: "IRA Hadir di Komunitas RT 01/RW 01!",
    date: "Kamis, 15 Des 2025 | 12:10",
    content:
      "Kini warga RT 01/RW 01 Cilandak bisa menikmati promo khusus: gratis pasang + diskon 20% selama 6 bulan pertama!",
  },
];
