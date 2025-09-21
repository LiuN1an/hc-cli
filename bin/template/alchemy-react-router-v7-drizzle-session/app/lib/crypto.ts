/**
 * 密码加密和验证工具
 * 使用Web Crypto API，兼容Cloudflare Workers
 */

/**
 * 生成随机盐值
 */
async function generateSalt(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * 使用PBKDF2算法哈希密码
 */
async function hashPasswordWithSalt(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // 导入密码为CryptoKey
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  
  // 使用PBKDF2进行密码派生
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // 10万次迭代
      hash: "SHA-256"
    } as Pbkdf2Params,
    keyMaterial,
    256 // 32字节输出
  );
  
  return new Uint8Array(derivedBits);
}

/**
 * 将Uint8Array转换为hex字符串
 */
function arrayBufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 将hex字符串转换为Uint8Array
 */
function hexToArrayBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * 哈希密码 - 返回盐值和哈希值的组合字符串
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await generateSalt();
  const hash = await hashPasswordWithSalt(password, salt);
  
  // 组合盐值和哈希值
  const saltHex = arrayBufferToHex(salt);
  const hashHex = arrayBufferToHex(hash);
  
  return `${saltHex}:${hashHex}`;
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // 分离盐值和哈希值
    const [saltHex, hashHex] = hashedPassword.split(':');
    if (!saltHex || !hashHex) {
      return false;
    }
    
    const salt = hexToArrayBuffer(saltHex);
    const storedHash = hexToArrayBuffer(hashHex);
    
    // 使用相同的盐值哈希输入密码
    const inputHash = await hashPasswordWithSalt(password, salt);
    
    // 比较哈希值
    if (inputHash.length !== storedHash.length) {
      return false;
    }
    
    // 使用时间安全的比较
    let result = 0;
    for (let i = 0; i < inputHash.length; i++) {
      result |= inputHash[i] ^ storedHash[i];
    }
    
    return result === 0;
  } catch (error) {
    console.error("密码验证错误:", error);
    return false;
  }
}
