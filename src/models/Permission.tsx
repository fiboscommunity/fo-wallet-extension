import Network from './Network'
import Keychain from './Keychain'
import { PermissionFields } from './PermissionFields'

export default class Permission {
    public domain: string
    public publicKey: string
    public hex: string = ''
    public fields: PermissionFields
    public transaction?: {[key: string]: any}
    public contract?: string = null
    public action?: string = null
    /**
     * 最后一次登录时间
     */
    public timespan: number = 0


    getIdentity(keychain: Keychain, hex: string) {
        return keychain.findIdentity(this.publicKey, hex)
    }

    /**
     * 用于获取当前激活的账户
     */
    isIdentityOnly() {
        return !this.contract && !this.action
    }

    /**
     * 用于获取当前激活的账户 (如果有域，就是查找这个域下的账户)
     * @param domain 
     */
    isDomainIdentity(domain?: string) {
        if (domain) {
            return this.isIdentityOnly() && this.domain === domain
        }
        return this.isIdentityOnly()
    }

    /**
     * json 2 model
     * @param json 
     */
    static deserialize(json: { [key: string]: any }): Permission {
        const p = Object.assign(new Permission(), json)
        if (json.hasOwnProperty('fields'))
            p.fields = PermissionFields.deserialize(json.fields)
        return p
    }

}