import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;

/**
 * Encrypt data using AES-256.
 * @param {string} plainText
 * @returns {string} encrypted cipher text
 */
export const encrypt = (plainText) => {
  if (!plainText) return plainText;
  return CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt AES-256 encrypted data.
 * @param {string} cipherText
 * @returns {string} decrypted plain text
 */
export const decrypt = (cipherText) => {
  if (!cipherText) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return cipherText; // Return as-is if decryption fails
  }
};

/**
 * Encrypt an object's sensitive fields.
 */
export const encryptFields = (obj, fields) => {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field]) {
      result[field] = encrypt(result[field]);
    }
  }
  return result;
};

/**
 * Decrypt an object's sensitive fields.
 */
export const decryptFields = (obj, fields) => {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field]) {
      result[field] = decrypt(result[field]);
    }
  }
  return result;
};
