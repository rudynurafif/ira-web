import {
  dana,
  ovo,
  linkAja,
  astraPay,
  shopeePay,
  jeniusPay,
  gopay,
} from "@/public/assets/Images/bank";

export const dataEWallet = [
  {
    id: 1,
    title: "Virtual Account",
    logo: [
      {
        name: "ID_DANA",
        image: dana,
        instructions: [
          {
            title: "Petunjuk E-Wallet",
            list: [
              "Buka aplikasi <b>DANA</b> lalu login",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account Billing</b>",
              "Masukkan nomor <b>Virtual Account</b> yang ditampilkan",
              "Konfirmasi data: nama & nominal pembayaran",
              "Masukkan <b>PIN</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "ID_SHOPEEPAY",
        image: shopeePay,
        instructions: [
          {
            title: "Petunjuk E-Wallet",
            list: [
              "Buka aplikasi <b>ShopeePay</b> lalu login",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account</b>",
              "Masukkan nomor <b>Virtual Account</b> yang ditampilkan",
              "Konfirmasi data: nama & nominal pembayaran",
              "Masukkan <b>PIN</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "ID_OVO",
        image: ovo,
        instructions: [
          {
            title: "Petunjuk E-Wallet",
            list: [
              "Buka aplikasi <b>OVO</b> dan login",
              "Pilih menu <b>Pembayaran</b>",
              "Pilih <b>Virtual Account</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan nominal",
              "Masukkan <b>PIN</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "ID_LINKAJA",
        image: linkAja,
        instructions: [
          {
            title: "Petunjuk E-Wallet",
            list: [
              "Buka aplikasi <b>LinkAja</b> dan login",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi data: nama & nominal pembayaran",
              "Masukkan <b>PIN</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "GOPAY",
        image: gopay,
        instructions: [
          {
            title: "Petunjuk E-Wallet",
            list: [
              "Buka aplikasi <b>GoPay</b> dan login",
              "Pilih menu <b>Pembayaran</b>",
              "Pilih <b>Virtual Account</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan nominal",
              "Masukkan <b>PIN</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "ID_ASTRAPAY",
        image: astraPay,
        instructions: [
          {
            title: "Petunjuk E-Wallet",
            list: [
              "Buka aplikasi <b>AstraPay</b> dan login",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi data: nama & nominal pembayaran",
              "Masukkan <b>PIN</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "ID_JENIUSPAY",
        image: jeniusPay,
        instructions: [
          {
            title: "Petunjuk E-Wallet",
            list: [
              "Buka aplikasi <b>Jenius</b> dan login",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi data: nama & nominal pembayaran",
              "Masukkan <b>PIN</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
    ],
    route: "EWALLET",
  },
];
