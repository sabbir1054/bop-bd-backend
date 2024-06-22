const generateRandomString = (length: number) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const orderCodeGenerator = (
  customerPhone: string,
  ownerPhone: string,
) => {
  const combinedPhones = customerPhone + ownerPhone;

  //* Extract 5 random digits from the combined phone numbers
  let extractedDigits = '';
  for (let i = 0; i < 5; i++) {
    extractedDigits += combinedPhones.charAt(
      Math.floor(Math.random() * combinedPhones.length),
    );
  }

  //* Generate a random string of 10 characters
  const randomString = generateRandomString(10);

  // Extract 5 random characters from the random string
  let extractedChars = '';
  for (let i = 0; i < 5; i++) {
    extractedChars += randomString.charAt(
      Math.floor(Math.random() * randomString.length),
    );
  }

  // Combine the extracted digits and characters
  const result = extractedDigits + extractedChars;
  return result;
};
