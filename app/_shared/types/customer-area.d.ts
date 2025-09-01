export type ActivePacketData = {
  isPaid: boolean;
  isActive: boolean;
  packageInfo: string;
  packagePrice: string;
  dueDate: string;
};

export type ProfileInfo = {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
};

export type SubscriptionHistory = {
  paid: boolean;
  mainTitle: string;
  packageInfo: string;
  subTitle: string;
  price: string;
};
