import { IdentityFields } from './IdentityFields'
import PluginFactory from '../plugins/PluginFactory'
import Network from './Network'
import Account from './Account'
import EncryptHelper from '../utils/EncryptHelper'

export default class Identity {
    public readonly hash: string
    public readonly publicKey: string
    public readonly name: string
    public accounts: { [key: string]: Account }

    constructor(
        publicKey: string = '',
        name: string = '',
        accounts: { [key: string]: Account } = {},
    ) {
        this.publicKey = publicKey
        this.name = name
        this.accounts = accounts
        this.hash = EncryptHelper.md5(`${this.name}_${this.publicKey}`)
    }

    networkedAccount(network: Network) {
        return this.accounts[network.unique2()]
    }

    hasAccount(network: Network) {
        if (!network.blockchain && !network.chainId) {
            return true
        }
        if (network.blockchain && !network.chainId) {
            const keys = Object.keys(this.accounts)
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].startsWith(`${network.blockchain}:`))
                    return true
            }
            return false
        }
        if (!network.blockchain && network.chainId) {
            const keys = Object.keys(this.accounts)
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].endsWith(`:${network.chainId}`))
                    return true
            }
            return false
        }
        return this.accounts.hasOwnProperty(network.unique2())
    }

    hasRequiredFields(fields: { [key: string]: any }) {
        const parsed = IdentityFields.deserialize(fields)
        if (parsed.accounts.length) {
            if (!parsed.accounts.every(network => this.hasAccount(network)))
                return false
        }
        return true
    }

    asOnlyRequiredFields(fields: { [key: string]: any }) {
        const fieldParsed = IdentityFields.deserialize(fields)
        const identity: { [key: string]: any } = {
            hash: this.hash,
            publicKey: this.publicKey,
            name: this.name,
            accounts: [],
        }
        if (fieldParsed.accounts.length > 0) {
            fieldParsed.accounts.forEach(network => {
                let acc
                if (network.blockchain && network.chainId)
                    acc = this.networkedAccount(network)
                else
                    acc = this.accounts[Object.keys(this.accounts)[0]]
                const account = PluginFactory.basePlugin().returnableAccount(acc)
                identity.accounts.push(Object.assign(account, { blockchain: network.blockchain }))
            })
        }
        return identity
    }

    static deserialize(json: { [key: string]: any }): Identity {
        const p = Object.assign(new Identity(), json)
        if (json.hasOwnProperty('accounts')) {
            for (let k in json.accounts)
                p.accounts[k] = Account.deserialize(json.accounts[k])
        }
        return p
    }

    hashStr(): string {
        return EncryptHelper.md5(`${this.name}_${this.publicKey}`)
    }

    /**
     * 根据公钥获取账户
     * @param publicKey 公钥
     */
    public getAccountFromPublicKey(publicKey: string): Account | undefined {
        const key = Object.keys(this.accounts).reverse().find(key => this.accounts[key].publicKey === publicKey)
        if (!key)
            return undefined
        return this.accounts[key]
    }
}

export class IdentitySub extends Identity {
    public token: string = ""
}