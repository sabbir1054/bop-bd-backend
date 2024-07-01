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
