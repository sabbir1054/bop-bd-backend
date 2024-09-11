export const isCodeValid = (validUntil: any) => {
  const today = new Date();

  // Check if validUntil is in the future
  return validUntil > today;
};
