import CryptoJS from 'crypto-js';

// Get encryption key from environment
const getEncryptionKey = (): string => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY not configured in environment variables');
    }
    return key;
};

/**
 * Encrypt a string using AES-256
 */
export function encrypt(text: string): string {
    if (!text) return '';
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(text, key).toString();
}

/**
 * Decrypt an AES-256 encrypted string
 */
export function decrypt(ciphertext: string): string {
    if (!ciphertext) return '';
    try {
        const key = getEncryptionKey();
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        console.error('Decryption failed');
        return '';
    }
}

/**
 * Check if a string appears to be encrypted
 * (Encrypted strings from crypto-js are base64 and start with 'U2F')
 */
export function isEncrypted(text: string): boolean {
    if (!text) return false;
    // CryptoJS encrypted strings have a specific format
    return text.startsWith('U2F') && text.length > 20;
}
