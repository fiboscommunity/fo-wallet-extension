import Keypair from './Keypair'
import Identity from './Identity'
import Permission from './Permission'
import Account from './Account'
import Signature from './Signature'

interface ICheckWhiteListProps {
    contract: string
    action: string
    domain: string
}

export default class Keychain {
    public keypairs: Array<Keypair> = []
    public identitys: Array<Identity> = []
    public permissions: Array<Permission> = []
    public signatures: Array<Signature> = []

    static generate(): Keychain {
        return new Keychain()
    }

    static deserialize(json: { [key: string]: any }): Keychain {
        const p = new Keychain()
        if (json.hasOwnProperty('keypairs'))
            p.keypairs = json.keypairs.map((e: { [key: string]: any }) => Keypair.deserialize(e))
        if (json.hasOwnProperty('identitys'))
            p.identitys = json.identitys.map((e: { [key: string]: any }) => Identity.deserialize(e))
        if (json.hasOwnProperty('permissions'))
            p.permissions = json.permissions.map((e: { [key: string]: any }) => Permission.deserialize(e))
        if (json.hasOwnProperty('signatures'))
            p.signatures = json.signatures.map((e: { [key: string]: any }) => Signature.deserialize(e))
        return p
    }

    /**
     * 检测是否有某个权限
     * @param permission 权限
     */
    public hasPermission(permission: Permission): boolean {
        for (let i = 0; i < this.permissions.length; i++) {
            const _permission = this.permissions[i]
            if (_permission.action === permission.action
                && _permission.contract === permission.contract
                && _permission.domain === permission.domain
                && _permission.publicKey === permission.publicKey) {
                return true
            }
        }
        return false
    }

    /**
     * 添加/更新权限
     * @param permission 权限
     */
    public updateOrInsertPermission(permission: Permission): void {
        for (let i = 0; i < this.permissions.length; i++) {
            const _permission = this.permissions[i]
            if (_permission.action === permission.action
                && _permission.contract === permission.contract
                && _permission.domain === permission.domain
                && _permission.publicKey === permission.publicKey) {
                this.permissions.splice(i, 1, permission)
                return
            }
        }
        this.permissions.push(permission)
    }

    /**
     * 是否在白名单中
     * @param contract 
     * @param action 
     * @param domain 
     */
    public isInWhiteList(params: ICheckWhiteListProps): boolean {
        return !!this.permissions.find(per =>
            per.domain === params.domain
            && per.action === params.action
            && per.contract === params.contract)
    }

    /**
     * 查找身份
     * @param publicKey 公钥
     */
    findIdentity(publicKey: string, hex: string) {
        return this.identitys.find(identity => identity.publicKey === publicKey && identity.hash === hex)
    }

    /**
     * 获取身份中的制动公钥的账户
     * @param publicKey 公钥
     */
    public findAccountsWithPublicKey(publicKey: string): Array<Account> {
        return this.identitys.map(identity => identity.getAccountFromPublicKey(publicKey))
            .filter(account => !!account)
    }
}