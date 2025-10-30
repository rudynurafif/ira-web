// Virtual account
import VAbca from "@/public/assets/Icons/payment-method/VA/logo-bca.png";
import VAbni from "@/public/assets/Icons/payment-method/VA/logo-bni.png";
import VAbjb from "@/public/assets/Icons/payment-method/VA/logo-bjb.png";
import VAbri from "@/public/assets/Icons/payment-method/VA/logo-bri.png";
import VAbsi from "@/public/assets/Icons/payment-method/VA/logo-bsi.png";
import VAcimb from "@/public/assets/Icons/payment-method/VA/logo-cimbniaga.png";
import VAmandiri from "@/public/assets/Icons/payment-method/VA/logo-mandiri.png";
import VApermata from "@/public/assets/Icons/payment-method/VA/logo-permata.png";

// ewallet
import ewalletDana from "@/public/assets/Icons/payment-method/ewallet/logo-dana.png";
import ewalletOVO from "@/public/assets/Icons/payment-method/ewallet/logo-ovo.png";
import ewalletSpay from "@/public/assets/Icons/payment-method/ewallet/logo-shopee.png";

// QR
import Qris from "@/public/assets/Icons/payment-method/QR/qris.png";
import QrisGopay from "@/public/assets/Icons/payment-method/QR/gopay-192x92-1.png";

// outlet
import outletAlfa from "@/public/assets/Icons/payment-method/outlet/logo-alfamart.png";
import outletIndomaret from "@/public/assets/Icons/payment-method/outlet/indomaret-large.png";
export const dataVa = [
  {
    id: 1,
    title: "Virtual Account",
    logo: [
      {
        name: "BNI_VIRTUAL_ACCOUNT",
        image: VAbni,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Buka aplikasi <b>BNI Mobile Banking</b> lalu login",
              "Pilih menu <b>Transfer</b>",
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
              "Pilih menu <b>Transfer</b>",
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
              "Pilih <b>Menu Lain > Transfer > Virtual Account Billing</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan nominal",
              "Tekan <b>Ya</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "BCA_VIRTUAL_ACCOUNT",
        image: VAbca,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Buka aplikasi <b>BCA Mobile Banking</b> lalu login",
              "Pilih menu <b>Transfer</b>",
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
              "Pilih menu <b>Transfer</b>",
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
              "Pilih <b>Menu Lain > Transfer > Virtual Account Billing</b>",
              "Masukkan nomor <b>Virtual Account</b>",
              "Konfirmasi nama dan nominal",
              "Tekan <b>Ya</b> untuk menyelesaikan transaksi",
            ],
          },
        ],
      },
      {
        name: "BJB_VIRTUAL_ACCOUNT",
        image: VAbjb,
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
        name: "BRI_VIRTUAL_ACCOUNT",
        image: VAbri,
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
        name: "BSI_VIRTUAL_ACCOUNT",
        image: VAbsi,
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
        name: "CIMB_VIRTUAL_ACCOUNT",
        image: VAcimb,
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
        name: "MANDIRI_VIRTUAL_ACCOUNT",
        image: VAmandiri,
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
        name: "PERMATA_VIRTUAL_ACCOUNT",
        image: VApermata,
        instructions: [
          {
            title: "Petunjuk mBanking",
            list: [
              "Login ke aplikasi <b>PermataMobile X</b>",
              "Pilih menu <b>Transfer</b>",
              "Pilih <b>Virtual Account</b>",
              "Masukkan nomor dan konfirmasi nama",
              "Selesaikan transaksi",
            ],
          },
          {
            title: "Petunjuk ATM",
            list: [
              "Masukkan kartu dan PIN",
              "Pilih menu <b>Transfer > Ke Rekening Permata Lain</b>",
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
