import CryptoJS from 'crypto-js';

/**
 * 3DESECB加密
 * @param string 待加密字符串
 * @param string 秘钥key
 * @return string 加密字符串
 */
export function ecryptThreeDESECB(text: string, key: string): string {
  // key不足24位自动以0(最小位数是0)补齐,如果多余24位,则截取前24位,后面多余则舍弃掉
  const base64 = CryptoJS.enc.Utf8.parse(key);
  const encrypt = CryptoJS.TripleDES.encrypt(text, base64, {
    mode: CryptoJS.mode.ECB, // ECB模式
    padding: CryptoJS.pad.Pkcs7 // padding处理
  });
  return encrypt.toString(); // 加密完成后，转换成字符串
}

/**
 * 3DESECB解密
 * @param string 加密字符串
 * @param string 秘钥key
 * @return string 解密字符串
 */
export function decryptThreeDESECB(text: string, key: string): string {
  // key不足24位自动以0(最小位数是0)补齐,如果多余24位,则截取前24位,后面多余则舍弃掉
  const base64 = CryptoJS.enc.Utf8.parse(key);
  const decrypt = CryptoJS.TripleDES.decrypt(text, base64, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypt.toString(CryptoJS.enc.Utf8); // 解析数据后转为UTF-8
}
