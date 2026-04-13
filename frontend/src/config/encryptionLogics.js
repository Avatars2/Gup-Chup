import CryptoJS from 'crypto-js';

const SECRET_SALT = 'gup-chup-e2ee-secret-salt-2026';

/**
 * Encrypts a message using AES.
 * @param {string} message - Plain text message
 * @param {string} chatId - The ID of the chat used to derive the key
 * @returns {string} - Encrypted cipher text
 */
export const encryptMessage = (message, chatId) => {
  if (!message || !chatId) return message;
  
  try {
    const key = chatId + SECRET_SALT;
    const encrypted = CryptoJS.AES.encrypt(message, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return message;
  }
};

/**
 * Decrypts a message using AES.
 * @param {string} ciphertext - Encrypted cipher text
 * @param {string} chatId - The ID of the chat used to derive the key
 * @returns {string} - Decrypted plain text or original if failed
 */
export const decryptMessage = (ciphertext, chatId) => {
  if (!ciphertext || !chatId) return ciphertext;
  
  // If it doesn't look like ciphertext (e.g. legacy plain text), return as is
  if (!ciphertext.startsWith('U2FsdGVkX1')) {
    return ciphertext;
  }

  try {
    const key = chatId + SECRET_SALT;
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      return "[Decryption Failed]";
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return "[Decryption Failed]";
  }
};
