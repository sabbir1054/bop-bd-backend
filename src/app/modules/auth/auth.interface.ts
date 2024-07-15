export type ILoginInfo = {
  phone: string;
  password: string;
};

export type ILoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type IRefreshTokenResponse = {
  accessToken: string;
};

export type IVerifyOtp = {
  phone: string;
  givenOtp: string;
};

export type IRegisterInfo = {
  name: string;
  phone: string;
  password: string;
  role:
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'MANUFACTURER'
    | 'IMPORTER'
    | 'WHOLESALER'
    | 'DEALER'
    | 'RESELLER'
    | 'STAFF';
  organizationId?: string;
  businessTypeId?: string;
  staffRole?:
    | 'ORDER_SUPERVISOR'
    | 'STAFF_ADMIN'
    | 'STORE_MANAGER'
    | 'DELIVERY_BOY'
    | 'ACCOUNTS_MANAGER'
    | 'PURCHASE_OFFICER';
  deliveryArea?: string;
};
