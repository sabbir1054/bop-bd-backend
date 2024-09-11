export const rewardPointsType = ['JOINING', 'BUYING'];
export type IRewardPoints = {
  rewardType: 'JOINING' | 'BUYING';
  membershipCategory: 'DIAMOND' | 'GOLD' | 'SILVER' | 'PLATINUM' | 'NORMAL';
  points: number;
};
