import CryptoJS from "crypto-js";

/**
 * @name MD5加密
 * @param {string} str 需要加密的字符串
 * @returns {string} 32位小写MD5字符串
 */
export function md5(str: string): string {
  return CryptoJS.MD5(str).toString();
}

/**
 * @name MD5加密-加盐版
 * @param {string} str 需要加密的字符串
 * @param {string} salt 盐值，建议从环境变量读取
 * @returns {string} 加密后的字符串
 */
export function md5WithSalt(str: string, salt?: string): string {
  const saltValue = salt || import.meta.env.VITE_MD5_SALT || "vue3-admin-salt";
  return CryptoJS.MD5(str + saltValue).toString();
}

/**
 * @name SHA256加密-更安全
 * @param {string} str 需要加密的原始字符串
 * @returns {string} 返回64位十六进制字符串（小写）
 */
export function sha256(str: string): string {
  return CryptoJS.SHA256(str).toString();
}

/**
 * @name Base64编码
 * @param {string} str 需要编码的原始字符串
 * @returns {string} 返回Base64编码后的字符串
 */
export function base64Encode(str: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
}

/**
 * @name Base64解码
 * @param {string} str Base64编码的字符串
 * @returns {string} 返回解码后的原始字符串
 */
export function base64Decode(str: string): string {
  return CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
}

/**
 * @name AES加密-对称加密
 * @param {string} data 需要加密的原始数据（明文）
 * @param {string} key 加密密钥，支持128位、192位或256位长度,建议使用256位（32字符）密钥以获得最高安全性
 * @returns {string} 返回Base64格式的加密字符串，包含初始向量（IV）和加密数据
 */
export function aesEncrypt(data: string, key: string): string {
  const encrypted = CryptoJS.AES.encrypt(data, key);
  return encrypted.toString();
}

/**
 * @name AES解密
 * @param {string} encryptedData Base64格式的加密字符串
 * @param {string} key 解密密钥，必须与加密时使用的密钥相同
 * @returns {string} 返回解密后的原始字符串
 */
export function aesDecrypt(encryptedData: string, key: string): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}
