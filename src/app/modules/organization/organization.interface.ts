export interface IRangeOfDate {
  startDate: string;
  endDate: string;
}
export type IupdateOrgaCategory = {
  organizationId: string;
  memberShipCategory: 'SILVER' | 'GOLD' | 'PLATINUM' | 'NORMAL' | 'DIAMOND';
};
