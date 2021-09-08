import SignaturePayload from './SignaturePayload'
import EncryptHelper from '../utils/EncryptHelper'
import Keypair from './Keypair'
import UtilsHelper from '../utils/UtilsHelper'

export default class Signature {
    /**
     * 签名所属的标识
     */
    public hex: string = ""
    /**
     * 载体
     */
    public payload: SignaturePayload
    /**
     * 签名数据
     */
    public token: string
    
    constructor(hex: string = "", payload: SignaturePayload = new SignaturePayload(), token: string = "") {
        this.hex = hex
        this.payload = payload
        this.token = token
    }

    /**
     * 生成签名数据
     */
    public toSignature(keypair: Keypair): string {
        const payloadBase64 = EncryptHelper.base64Encoder(this.payload.serialize())
        const eccHex = keypair.signData(UtilsHelper.string2UintArray(payloadBase64))
        return `${payloadBase64}.${eccHex}`
    }

    /**
     * 反序列化
     * @param json json字符串
     */
    static deserialize(json: { [key: string]: any }): Signature {
        const p = Object.assign(new Signature(), json)
        if (json.hasOwnProperty('payload'))
            p.payload = SignaturePayload.deserialize(p.payload)
        return p
    }
}