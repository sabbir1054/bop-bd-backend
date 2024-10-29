export interface IRangeOfDate {
  startDate: string;
  endDate: string;
}
export type IupdateOrgaCategory = {
  organizationId: string;
  memberShipCategory: 'SILVER' | 'GOLD' | 'PLATINUM' | 'NORMAL' | 'DIAMOND';
};
export type IUpdateOrga = {
  businessTypeId?: string;
  role?: 'MANUFACTURER' | 'IMPORTER' | 'WHOLESALER' | 'DEALER' | 'RESELLER';
};
