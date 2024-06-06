export const checkPhoneNumberFormate = (phone: string) => {
  if (phone.length !== 11) {
    return false;
  }
  if (!phone.startsWith('01')) {
    return false;
  }
  if (!/^[0-9]+$/.test(phone)) {
    return false;
  }
  return true;
};
