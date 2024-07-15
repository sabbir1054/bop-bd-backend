export interface IUserUpdate {
  name?: string;
  memberCategory?: string;
  verified?: boolean;
  email?: string;
  address?: string;
  photo?: string;
  license?: string;
  nid?: string;
}
export type IStaffRole = {
  staffRole?:
    | 'ORDER_SUPERVISOR'
    | 'STAFF_ADMIN'
    | 'STORE_MANAGER'
    | 'DELIVERY_BOY'
    | 'ACCOUNTS_MANAGER'
    | 'PURCHASE_OFFICER';
};
