import { enc, AES, mode, pad, MD5, HmacMD5 } from 'crypto-js'
import Fibos from 'fibos.js'
import UtilsHelper from './UtilsHelper'
import { ErrorCodeEnum } from '../models/Enum'

const { ecc } = Fibos.modules

export default class EncryptHelper {
    /**
     * AES加密
     * @param iv iv向量
     * @param salt 盐值
     * @param str 待加密的字符串
     */
    public static aesEncrypt(iv: string, salt: string, str: string): string {
        if (iv.length !== 16)
            throw UtilsHelper.createError(ErrorCodeEnum.encrypt, 'iv invalid')
        if (salt.length < 0)
            throw UtilsHelper.createError(ErrorCodeEnum.encrypt, 'salt invalid')
        const iv_ = enc.Utf8.parse(iv)
        const salt_ = enc.Utf8.parse(salt)
        let decoder = enc.Utf8.parse(str)
        const encrypted = AES.encrypt(decoder, salt_, { iv: iv_, mode: mode.CBC, padding: pad.Pkcs7 })
        return encrypted.ciphertext.toString()
    }

    /**
     * AES解密
     * @param iv iv向量
     * @param salt 盐值
     * @param str 待解密的字符串
     */
    public static aesDecrypt(iv: string, salt: string, str: string): string {
        if (iv.length !== 16)
            throw UtilsHelper.createError(ErrorCodeEnum.encrypt, 'iv invalid')
        if (salt.length < 0)
            throw UtilsHelper.createError(ErrorCodeEnum.encrypt, 'salt invalid')
        const iv_ = enc.Utf8.parse(iv)
        const salt_ = enc.Utf8.parse(salt)
        let dncryptStr = enc.Hex.parse(str)
        dncryptStr = enc.Base64.stringify(dncryptStr)
        let decrypt = AES.decrypt(dncryptStr, salt_, { iv: iv_, mode: mode.CBC, padding: pad.Pkcs7 })
        decrypt = decrypt.toString(enc.Utf8)
        return decrypt.toString()
    }

    /**
     * MD5
     * @param str 待加密字符串
     * @param salt 盐 (optional)
     */
    public static md5(str: string, salt?: string): string {
        let isStr = Object.prototype.toString.call(salt) !== '[object String]'
        if (salt === undefined)
            if (isStr)
                return MD5(str).toString()
            else
                return MD5(JSON.stringify(str)).toString()
        if (isStr)
            return HmacMD5(str, salt).toString()
        return HmacMD5(str, JSON.stringify(salt)).toString()
    }

    /**
     * base64 编码
     * @param str 字符串
     */
    public static base64Encoder(str: string): string {
        const hex = enc.Utf8.parse(str)
        return enc.Base64.stringify(hex)
    }

    /**
     * base64 解码
     * @param hex base64字符串
     */
    public static base64Decoder(hex: string): string {
        const str = enc.Base64.parse(hex)
        return str.toString(enc.Utf8)
    }
}