export const memberCategory = [
  'SILVER',
  'GOLD',
  'PLATINUM',
  'NORMAL',
  'DIAMOND',
];
export const StaffRole = [
  'ORDER_SUPERVISOR',
  'STAFF_ADMIN',
  'STORE_MANAGER',
  'DELIVERY_BOY',
  'ACCOUNTS_MANAGER',
  'PURCHASE_OFFICER',
];
export type IUpdateStaffPayload = {
  staffId: string;
  updatedRole:
    | 'STAFF_ADMIN'
    | 'ORDER_SUPERVISOR'
    | 'STORE_MANAGER'
    | 'DELIVERY_BOY'
    | 'ACCOUNTS_MANAGER'
    | 'PURCHASE_OFFICER';
};
export const userSearchableFields: string[] = ['phone'];

export const userFilterableFields: string[] = [
  'searchTerm',
  'verified',
  'isMobileVerified',
  'isEmailVerified',
  'isNidVerified',
];
