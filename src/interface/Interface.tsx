import FOScatter from '../models/FOScatter'
import StorageHelper from '../utils/StorageHelper'
import UtilsHelper from '../utils/UtilsHelper'
import Network from '../models/Network'
import EncryptHelper from '../utils/EncryptHelper'
import RandomFactory from '../utils/RandomFactory'
import { LanguageEnum } from '../models/Enum'
import Keypair from '../models/Keypair'
import Identity from '../models/Identity'
import Permission from '../models/Permission'

class FOScatterInterface {
    private instance: FOScatter
    private timer: number = null

    constructor() {
        StorageHelper.getScatter()
            .then(scatter => {
                this.instance = scatter
            })
    }

    /**
     * 获取实例
     */
    public getScatter(): FOScatter {
        return this.instance
    }

    /**
     * 设置scatter
     * @param scatter 
     */
    public setScatter(scatter: FOScatter): void {
        this.instance = scatter
    }

    /**
     * 持久化
     */
    private storage() {
        // 持久化写入队列，当200毫秒内多次调用此方法是，前一次会被取消
        if (this.timer) {
            window.clearTimeout(this.timer)
            this.timer = null
        }
        this.timer = window.setTimeout(() => {
            StorageHelper.save<FOScatter>(UtilsHelper.getScatterKey(), this.instance)
        }, 200)
    }

    /**
     * 保存scatter
     * @param scatter 
     */
    saveScatter(scatter: FOScatter): boolean {
        this.instance = scatter
        this.storage()
        return true
    }

    //#region ------ Setting Region ---------------------

    /**
     * 添加网络
     * @param network 网络模型
     */
    addNetwork(network: Network): boolean {
        const findNetwork = this.instance.setting.networks.find(e => e.unique() === network.unique())
        if (!findNetwork) {
            this.instance.setting.networks.push(network)
            this.storage()
        }
        return true
    }

    /**
     * 删除网络
     * @param network 网络模型
     */
    delNetwork(network: Network): boolean {
        for (let i = 0; i < this.instance.setting.networks.length; i++) {
            const _network = this.instance.setting.networks[i]
            if (network.unique() === _network.unique()) {
                this.instance.setting.networks.splice(i, 1)
                this.storage()
                break
            }
        }
        return true
    }

    /**
     * 锁定
     */
    lockScatter(): boolean {
        if (this.instance.setting.locked) {
            return true
        }
        this.instance.setting.locked = true
        this.storage()
        return true
    }

    /**
     * 解锁插件
     * @param password 验证密码
     */
    unlockScatter(password: string): boolean {
        if (!this.instance.setting.locked) {
            return true
        }
        const hash1 = EncryptHelper.md5(password)
        const hash2 = EncryptHelper.md5(hash1, RandomFactory.systemSalt())
        if (hash2 === this.instance.setting.password) {
            this.instance.setting.locked = false
            this.storage()
            return true
        }
        return false
    }

    /**
     * 修改密码
     * @param password 原密码
     * @param newPassword 新密码
     */
    updatePassword(password: string, newPassword: string): boolean {
        const hash1 = EncryptHelper.md5(password)
        const hash2 = EncryptHelper.md5(hash1, RandomFactory.systemSalt())
        if (hash2 === this.instance.setting.password) {
            const hash3 = EncryptHelper.md5(newPassword)
            const hash4 = EncryptHelper.md5(hash3, RandomFactory.systemSalt())
            this.instance.setting.password = hash4
            this.storage()
            return true
        }
        return false
    }

    /**
     * 修改语言环境
     * @param lan 语言环境
     */
    updateLanguage(lan: LanguageEnum): boolean {
        if (this.instance.setting.language === lan) {
            return true
        }
        this.instance.setting.language = lan
        this.storage()
        return true
    }

    /**
     * 标记已经创建
     */
    markHasCreated(): boolean {
        if (this.instance.setting.created) {
            return true
        }
        this.instance.setting.created = true
        this.storage()
        return true
    }

    //#endregion


    //#region ------ KeyChain Region ---------------------

    /**
     * 添加公私钥对
     * @param keypair 公私钥对
     */
    addKeypair(keypair: Keypair) {
        const _keypair = this.instance.keyChain.keypairs.find(e => e.unique() === keypair.unique())
        if (!_keypair) {
            this.instance.keyChain.keypairs.push(keypair)
            this.storage()
        }
        return true
    }

    /**
     * 删除公私钥对
     * @param keypair 公私钥对
     */
    delKeypair(keypair: Keypair): boolean {
        const len = this.instance.keyChain.keypairs.length
        for (let i = 0; i < len; i++) {
            const _keypair = this.instance.keyChain.keypairs[i]
            if (_keypair.unique() === keypair.unique()) {
                this.instance.keyChain.keypairs.splice(i, 1)
                this.storage()
                break
            }
        }
        return true
    }

    /**
     * 添加身份
     * @param identity 身份
     */
    addIdentity(identity: Identity): boolean {
        const _identity = this.instance.keyChain.identitys.find(e => e.hashStr() === identity.hashStr())
        if (!_identity) {
            this.instance.keyChain.identitys.push(identity)
            this.storage()
        }
        return true
    }

    /**
     * 删除身份
     * @param identity 身份
     */
    delIdentity(identity: Identity): boolean {
        const len = this.instance.keyChain.identitys.length
        for (let i = 0; i < len; i++) {
            const _identity = this.instance.keyChain.identitys[i]
            if (_identity.hashStr() === identity.hashStr()) {
                this.instance.keyChain.identitys.splice(i, 1)
                const signatureLength = this.instance.keyChain.signatures.length
                for (let j = signatureLength - 1; j >= 0; j--) {
                    const signature = this.instance.keyChain.signatures[j]
                    if (signature.hex.startsWith(identity.name)) {
                        this.instance.keyChain.signatures.splice(j, 1)
                    }
                }
                const length = this.instance.keyChain.permissions.length
                for (let j = length - 1; j >= 0; j--) {
                    const _permission = this.instance.keyChain.permissions[j]
                    if (_permission.publicKey === identity.publicKey) {
                        this.instance.keyChain.permissions.splice(j, 1)
                    }
                }
                this.storage()
                break
            }
        }
        return true
    }

    /**
     * 添加权限
     * @param permission 权限
     */
    addPermission(permission: Permission): boolean {
        const _permission = this.instance.keyChain.permissions.find(e => {
            return (
                e.domain === permission.domain
                && e.action === permission.action
                && e.contract === permission.contract
                && e.publicKey === permission.publicKey
            )
        })
        if (!_permission) {
            this.instance.keyChain.permissions.push(permission)
            this.storage()
        }
        return true
    }

    /**
     * 删除权限
     * @param permission 权限
     */
    delPermisssion(permission: Permission): boolean {
        const len = this.instance.keyChain.permissions.length
        for (let i = 0; i < len; i++) {
            const _permission = this.instance.keyChain.permissions[i]
            if (_permission.domain === permission.domain
                && _permission.action === permission.action
                && _permission.contract === permission.contract
                && _permission.publicKey === permission.publicKey) {
                this.instance.keyChain.permissions.splice(i, 1)
                this.storage()
                break
            }
        }
        return true
    }

    /**
     * 移除某个合约下的所有白名单
     * @param contract 合约名
     */
    revokePermission(contract: string, domain: string): boolean {
        const len = this.instance.keyChain.permissions.length
        let has: boolean = false
        for (let i = len - 1; i >= 0; i--) {
            const _permission = this.instance.keyChain.permissions[i]
            if (_permission.contract === contract
                && _permission.domain === domain
                && _permission.action !== null
                && _permission.contract !== null) {
                has = true
                this.instance.keyChain.permissions.splice(i, 1)
            }
        }
        if (has) {
            this.storage()
        }
        return true
    }

    /**
     * 删除身份
     * @param permission 权限
     */
    revokeIdentity(permission: Permission): boolean {
        const len = this.instance.keyChain.permissions.length
        let exist: boolean = false
        for (let i = len - 1; i >= 0; i--) {
            const _permission = this.instance.keyChain.permissions[i]
            if (_permission.publicKey === permission.publicKey
                && _permission.domain === permission.domain) {
                exist = true
                this.instance.keyChain.permissions.splice(i, 1)
                break
            }
        }
        if (exist) {
            this.storage()
        }
        return true
    }

    //#endregion

}

export default new FOScatterInterface()