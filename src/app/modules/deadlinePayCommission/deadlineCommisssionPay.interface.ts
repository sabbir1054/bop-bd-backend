export type IHandleDeadlineRequest = {
  requestId: string;
  updatedStatus: 'PENDING' | 'APPROVED' | 'CANCEL';
  extendDays: number;
};
