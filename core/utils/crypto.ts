import {lzw_compress, lzw_decompress} from './tools.util';

const CryptoJS = require('crypto-js');
import {AnyJson} from '../base/common';

const key = 'qkc secret key 123';

// 解密方法
function Decrypt(word, salt?) {
  return JSON.parse(CryptoJS.AES.decrypt(word, (salt ? (salt + key) : key)).toString(CryptoJS.enc.Utf8));
}

// 加密方法
function Encrypt(word, salt?) {
  return CryptoJS.AES.encrypt(JSON.stringify(word), (salt ? (salt + key) : key)).toString();
}


function codeJsonAES(source: AnyJson, type = 'encode'): AnyJson {
  const result = {};
  const process = type === 'encode' ? Encrypt : Decrypt;
  if (!source) {
    return result;
  }
  for (const attr in source) {
    if (source.hasOwnProperty(attr)) {
      result[process(attr)] = process(source[attr]);
    }
  }
  return result;
}


export {
  Decrypt,
  Encrypt,
  codeJsonAES
};
