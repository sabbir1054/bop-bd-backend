export const rewardPointsType = ['JOINING', 'BUYING', 'SELLING'];
export type IRewardPoints = {
  rewardType: 'JOINING' | 'BUYING' | 'SELLING';
  membershipCategory: 'DIAMOND' | 'GOLD' | 'SILVER' | 'PLATINUM' | 'NORMAL';
  points: number;
};
