// outlet
import outletAlfa from "@/public/assets/Icons/payment-method/outlet/logo-alfamart.png";
import outletIndomaret from "@/public/assets/Icons/payment-method/outlet/indomaret-large.png";

export const dataOutlet = [
  {
    id: 4,
    title: "Outlet",
    logo: [
      {
        name: "INDOMARET",
        image: outletIndomaret,
        instructions: [
          {
            title: "Petunjuk Bayar Indomaret",
            list: [
              "Datangi Indomaret terdekat dan informasikan ingin membayar tagihan <b>“PT. INTEGRASI JARINGAN EKOSISTEM”</b>",
              "Tunjukkan <b>barcode pembayaran</b> di atas",
              "Pastikan nominal yang keluar sesuai dengan nominal total pembayaran.",
              "Kasir akan memproses tagihan > bayar sesuai nominal > simpan struk sebagai bukti pembayaran",
            ],
          },
        ],
      },
    ],
    route: "OUTLET",
  },
];

// outletAlfa
