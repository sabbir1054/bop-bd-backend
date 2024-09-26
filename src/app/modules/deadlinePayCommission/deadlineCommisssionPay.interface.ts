export type IHandleDeadlineRequest = {
  updatedStatus?: 'PENDING' | 'APPROVED' | 'CANCEL';
  extendDays?: number;
  comment?: string;
};
