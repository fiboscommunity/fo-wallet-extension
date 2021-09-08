import Fibos from 'fibos.js'
import EncryptHelper from '../utils/EncryptHelper'
import RandomFactory from '../utils/RandomFactory'
import { kFIBOS } from '../constKeys/ConstKeys'

const { ecc } = Fibos.modules

export interface IKeypair {
    blockChain: string
    name: string
    privateKey: string
    publicKey: string
    iv: string
}

export default class Keypair {
    public readonly blockChain: string = kFIBOS
    public readonly name: string = ''
    public readonly privateKey: string = ''
    public readonly publicKey: string = ''
    public readonly iv: string = ''

    constructor(props?: IKeypair) {
        if (props) {
            this.blockChain = props.blockChain
            this.name = props.name
            this.privateKey = props.privateKey
            this.publicKey = props.publicKey
            this.iv = props.iv
        }
    }

    static deserialize(json: { [key: string]: any }): Keypair {
        return Object.assign(new Keypair(), json)
    }


    public unique() {
        return `${this.blockChain}:${this.publicKey.toLowerCase()}`
    }

    public getPrivateKey(salt: string): string {
      return EncryptHelper.aesDecrypt(this.iv, salt, this.privateKey)
    }

    public signData(buf: Uint8Array): string {
        const buffer = Buffer.from(buf)
        const privateKey = EncryptHelper.aesDecrypt(this.iv, RandomFactory.systemSalt(), this.privateKey)
        return ecc.Signature.sign(buffer, privateKey, true).toString()
    }

}