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

export const packageList: any = [
  {
    id: 1,
    name: "Starlite 7 Hari [UNLIMITED]",
    price: 29000,
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
    name: "Starlite 14 Hari [UNLIMITED]",
    price: 49000,
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
    name: "Starlite 30 Hari [UNLIMITED]",
    price: 79000,
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
