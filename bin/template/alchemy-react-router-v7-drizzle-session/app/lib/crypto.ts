/**
 * 密码加密工具 - 使用 Web Crypto API
 *
 * 使用 PBKDF2 算法进行密码哈希，适用于 Cloudflare Workers 环境
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;

/**
 * 生成随机盐值
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * 将 ArrayBuffer 转换为 hex 字符串
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * 将 hex 字符串转换为 Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * 使用 PBKDF2 派生密钥
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // 导入密码作为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  // 派生密钥
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH
  );

  return derivedBits;
}

/**
 * 对密码进行哈希
 * @returns 格式为 "salt:hash" 的字符串
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const derivedKey = await deriveKey(password, salt);

  const saltHex = bufferToHex(salt);
  const hashHex = bufferToHex(derivedKey);

  return `${saltHex}:${hashHex}`;
}

/**
 * 验证密码
 * @param password 用户输入的密码
 * @param storedHash 存储的哈希值（格式为 "salt:hash"）
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) {
    return false;
  }

  const salt = hexToBuffer(saltHex);
  const derivedKey = await deriveKey(password, salt);
  const derivedHashHex = bufferToHex(derivedKey);

  // 使用时间安全的比较
  return timingSafeEqual(hashHex, derivedHashHex);
}

/**
 * 时间安全的字符串比较
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

