/**
 * Web Crypto API (Client-side AES-256-GCM & SHA-256)
 * Đẩy toàn bộ chi phí tính toán mã hóa về máy khách (0đ Server CPU, Zero-Knowledge)
 */

export interface ClientCryptoResult {
  ciphertextBase64: string;
  ivBase64: string;
  sha256: string;
  keyExportableHex: string;
}

export async function generateClientAesKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKeyToHex(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function importKeyFromHex(hexStr: string): Promise<CryptoKey> {
  const bytes = new Uint8Array(hexStr.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexStr.slice(i * 2, i * 2 + 2), 16);
  }
  return await window.crypto.subtle.importKey(
    'raw',
    bytes,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptClientSide(
  plaintext: string,
  key: CryptoKey
): Promise<ClientCryptoResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // 1. Tính SHA-256
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const sha256 = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // 2. Sinh IV 12 bytes
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 3. Mã hóa AES-256-GCM
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    key,
    data
  );

  const ciphertextBase64 = btoa(
    String.fromCharCode(...new Uint8Array(ciphertextBuffer))
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const keyHex = await exportKeyToHex(key);

  return {
    ciphertextBase64,
    ivBase64,
    sha256,
    keyExportableHex: keyHex,
  };
}

export async function decryptClientSide(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  const ciphertextBytes = Uint8Array.from(atob(ciphertextBase64), (c) =>
    c.charCodeAt(0)
  );
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    key,
    ciphertextBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
