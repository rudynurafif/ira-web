import {
  bca,
  bjb,
  bni,
  bri,
  bsi,
  cimb,
  mandiri,
  permata,
} from "@/public/assets/Images/bank";

export const dataVa = [
  {
    id: 1,
    title: "Virtual Account",
    logo: [
      {
        name: "BNI",
        image: bni,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Buka aplikasi <b>BNI Mobile Banking</b> lalu login",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account Billing</b>",
              "Masukkan nomor <b>Virtual Account</b> yang ditampilkan",
              "Konfirmasi data: nama & nominal pembayaran",
              "Masukkan <b>MPIN</b> untuk menyelesaikan transaksi",
            ],
          },
          {
            title: "Petunjuk iBanking",
            list: [
              "Login ke <b>https://ibank.bni.co.id</b>",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account Billing</b>",
              "Masukkan nomor Virtual Account dan klik <b>Lanjut</b>",
              "Konfirmasi dan masukkan <b>kode OTP</b>",
              "Transaksi selesai",
            ],
          },
          {
            title: "Petunjuk ATM",
            list: [
              "Masukkan <b>kartu ATM BNI</b> dan PIN",
              // "Pilih <b>Menu Lain > Transfer > Virtual Account Billing</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan nominal",
              "Tekan <b>Ya</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "BCA",
        image: bca,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Buka aplikasi <b>BCA Mobile Banking</b> lalu login",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account Billing</b>",
              "Masukkan nomor <b>Virtual Account</b> yang ditampilkan",
              "Konfirmasi data: nama & nominal pembayaran",
              "Masukkan <b>MPIN</b> untuk menyelesaikan transaksi",
            ],
          },
          {
            title: "Petunjuk iBanking",
            list: [
              "Login ke <b>https://ibank.bca.co.id</b>",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account Billing</b>",
              "Masukkan nomor Virtual Account dan klik <b>Lanjut</b>",
              "Konfirmasi dan masukkan <b>kode OTP</b>",
              "Transaksi selesai",
            ],
          },
          {
            title: "Petunjuk ATM",
            list: [
              "Masukkan <b>kartu ATM BCA</b> dan PIN",
              "Pilih <b>Menu Lain > Virtual Account Billing</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan nominal",
              "Tekan <b>Ya</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "BJB",
        image: bjb,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Buka aplikasi <b>bjb DIGI</b> dan login",
              "Pilih menu <b>Pembayaran</b>",
              "Pilih <b>Virtual Account</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan nominal",
              "Masukkan PIN untuk menyelesaikan transaksi",
            ],
          },
          {
            title: "Petunjuk ATM",
            list: [
              "Masukkan kartu ATM dan PIN",
              "Pilih <b>Pembayaran > Virtual Account</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan jumlah",
              "Selesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "BRI",
        image: bri,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Buka aplikasi <b>BRImo</b> dan login",
              "Pilih menu <b>BRIVA</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Cek dan konfirmasi data",
              "Masukkan PIN untuk menyelesaikan transaksi",
            ],
          },
          {
            title: "Petunjuk ATM",
            list: [
              "Masukkan kartu ATM dan PIN",
              "Pilih <b>Transaksi Lain > Pembayaran > BRIVA</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi data dan tekan <b>Ya</b>",
            ],
          },
        ],
      },
      {
        name: "BSI",
        image: bsi,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Login ke <b>BSI Mobile</b>",
              "Pilih menu <b>Bayar > Virtual Account</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan nominal",
              "Masukkan PIN untuk menyelesaikan transaksi",
            ],
          },
          {
            title: "Petunjuk ATM",
            list: [
              "Masukkan kartu ATM dan PIN",
              "Pilih <b>Transaksi Lainnya > Pembayaran > Virtual Account</b>",
              "Masukkan nomor VA dan tekan <b>Benar</b>",
              "Konfirmasi dan tekan <b>Ya</b>",
            ],
          },
        ],
      },
      {
        name: "CIMB",
        image: cimb,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Login ke <b>OCTO Mobile</b>",
              "Pilih menu <b>Bayar</b>",
              "Pilih <b>Rekening Virtual</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan nominal, lalu bayar",
            ],
          },
          {
            title: "Petunjuk ATM",
            list: [
              "Masukkan kartu CIMB dan PIN",
              "Pilih <b>Pembayaran > Virtual Account</b>",
              "Masukkan nomor VA",
              "Konfirmasi dan tekan <b>Ya</b>",
            ],
          },
        ],
      },
      {
        name: "MANDIRI",
        image: mandiri,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Login ke aplikasi <b>Livin' by Mandiri</b>",
              "Pilih <b>Bayar > Multipayment</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan jumlah",
              "Selesaikan transaksi dengan PIN",
            ],
          },
          {
            title: "Petunjuk ATM",
            list: [
              "Masukkan kartu dan PIN",
              "Pilih <b>Pembayaran > Multi Payment</b>",
              "Masukkan nomor Virtual Account",
              "Konfirmasi nama dan nominal, lalu tekan <b>Ya</b>",
            ],
          },
        ],
      },
      {
        name: "PERMATA",
        image: permata,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Login ke aplikasi <b>PermataMobile X</b>",
              // "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account</b>",
              "Masukkan nomor dan konfirmasi nama",
              "Selesaikan transaksi",
            ],
          },
          {
            title: "Petunjuk ATM",
            list: [
              "Masukkan kartu dan PIN",
              "Pilih menu <b>> Ke Rekening Permata Lain</b>",
              "Masukkan nomor Virtual Account",
              "Konfirmasi dan tekan <b>Ya</b>",
            ],
          },
        ],
      },
    ],
    route: "VA",
  },
];
