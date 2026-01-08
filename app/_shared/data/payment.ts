import {
  bni,
  bjb,
  bri,
  bsi,
  cimb,
  mandiri,
  permata,
  qris,
  gopay,
  dana,
  ovo,
  indomaret,
  astraPay,
  bnc,
  linkAja,
  muamalat,
  bca,
  shopeePay,
  jeniusPay,
  alfamart,
} from "@/public/assets/Images/bank";
import ccSvg from "@/public/assets/Icons/payment-method/credit-card-svg.svg";

export const PAYMENT_LOGOS: Record<string, any> = {
  // Virtual Account
  BNI: bni,
  BJB: bjb,
  BRI: bri,
  BSI: bsi,
  CIMB: cimb,
  MANDIRI: mandiri,
  PERMATA: permata,
  BNC: bnc,
  MUAMALAT: muamalat,
  BCA: bca,

  // E-Wallet
  GOPAY: gopay,
  ID_DANA: dana,
  OVO: ovo,
  LINKAJA: linkAja,
  ASTRAPAY: astraPay,
  ID_SHOPEEPAY: shopeePay,
  JENIUSPAY: jeniusPay,

  // Card
  CARDS: ccSvg,

  // Outlet
  INDOMARET: indomaret,
  ALFAMART: alfamart,

  // QRIS
  QRIS: qris,
};
