import { LocalStream } from 'extension-streams'
import MessageNotify from './utils/MessageNotify'
import * as ConstKeys from './constKeys/ConstKeys'
import apis from './utils/ApiHelper'
import NotificationHelper from './utils/NotificationHelper'
import Prompt from './models/Prompt'
import UtilsHelper from './utils/UtilsHelper'
import { ErrorCodeEnum } from './models/Enum'
import FOScatter from './models/FOScatter'
import StorageHelper from './utils/StorageHelper'
import IdentityHelper from './utils/IdentityHelper'
import Permission from './models/Permission'
import { PermissionFields } from './models/PermissionFields'
import { ISignProviderParams, IRequestParserResponse } from './plugins/PluginModel'
import CustomError from './models/CustomError'

class Background {
    private locked: boolean = false

    constructor() {
        this.addObserver()
    }

    addObserver() {
        LocalStream.watch((request: any, response: any) => {
            const parsed = MessageNotify.deserialize(request)
            this.handleMessage(parsed, response)
        })
    }

    handleMessage(parsed: MessageNotify, response: any) {
        switch (parsed.type) {
            case ConstKeys.FO_SET_STATUS:
                this.setStatus(parsed.payload, response)
            case ConstKeys.FO_GET_STATUS:
                this.getStatus(response)
                break
            case ConstKeys.GET_VERSION:
                this.requestGetVersion(response)
                break
            case ConstKeys.FO_IDENTITY_FROM_PERMISSION:
                this.identityFromPermissions(parsed.payload, response)
                break
            case ConstKeys.GET_REQUEST_IDENTITY:
                this.getRequestIdentity(parsed.payload, response)
                break
            case ConstKeys.FO_REQUEST_SIGN:
                this.requestSign(parsed.payload, response)
                break
            case ConstKeys.FORGET_IDENTITY:
                this.forgetIdentity(parsed.payload, response)
                break
            case ConstKeys.REQUEST_ATTRIBUTE_SIGN:
                this.requestAttributeSign(parsed.payload, response)
                break
            case ConstKeys.REFRESH_IDENTITY:
                this.identityFromPermissions(parsed.payload, response)
                break
        }
    }

    setStatus(payload: boolean, response: () => void) {
        this.locked = payload
        response()
    }

    getStatus(response: (locked: boolean) => void) {
        response(this.locked)
    }

    requestGetVersion(response: (version: string) => void) {
        response(apis.app.getDetails().version)
    }

    async identityFromPermissions(payload: any, response: (resp: any) => void) {
        const scatter = await StorageHelper.getScatter()
        this.locked = scatter.setting.locked
        if (this.locked) {
            response(null)
            return
        }
        const domain = payload.domain
        const permission = IdentityHelper.identityPermission(domain, scatter)
        if (!permission)
            response(null)
        else {
            const identity = permission.getIdentity(scatter.keyChain, permission.hex)
            let resp = identity.asOnlyRequiredFields(permission.fields)
            const signature = scatter.keyChain.signatures.find(e => e.hex === UtilsHelper.signatureHex(identity.publicKey, domain))
            if (signature && signature.payload.exp > +new Date()) {
                resp.token = signature.token
                response(resp)
            } else {
                response(null)
            }
        }
    }

    async getRequestIdentity(payload: any, response: (result: any) => void) {
        if (this.locked) {
            response(UtilsHelper.createError(ErrorCodeEnum.identity, 'locked'))
            NotificationHelper.openWindow(new Prompt(
                ConstKeys.FO_IS_UNLOCK, '', null, {}, () => { }, null
            ))
            return
        }
        const scatter = await StorageHelper.getScatter()
        const { domain, fields, network } = payload
        IdentityHelper.getOrRequestIdentity({
            domain, fields, scatter, network,
            callback: (identity, fromPermission) => {
                if (!identity) {
                    response(UtilsHelper.createError(ErrorCodeEnum.identity, 'User rejected the provision of an Identity'))
                    return
                }
                if (!fromPermission) {
                    let permission = new Permission()
                    permission.domain = domain
                    permission.publicKey = identity.publicKey
                    permission.timespan = +new Date()
                    permission.hex = identity.hash
                    permission.fields = PermissionFields.deserialize(fields)
                    StorageHelper.getScatter()
                        .then(_scatter => {
                            _scatter.keyChain.updateOrInsertPermission(permission)
                            _scatter.storage()
                        })
                }
                response(identity)
            }
        })
    }

    /**
     * 签名数据
     * @param scatter scatter对象
     * @param domain 域
     * @param args 签名参数
     */
    private sign(permission: Permission, scatter: FOScatter, buf: Uint8Array): string {
        if (permission) {
            const kp = scatter.keyChain.keypairs.find(kp => kp.publicKey === permission.publicKey)
            if (kp)
                return kp.signData(buf)
        }
        return ''
    }

    /**
     * 添加白名单
     * @param permission 权限
     * @param scatter scatter
     * @param domain 域
     * @param message 讯息
     */
    private addWhiteList(permission: Permission, scatter: FOScatter, domain: string, message: Array<IRequestParserResponse>) {
        for (let i = 0; i < message.length; i++) {
            const msg = message[i]
            let p = new Permission()
            p.contract = msg.code
            p.action = msg.type
            p.domain = domain
            p.transaction = msg.data
            p.publicKey = permission.publicKey
            p.timespan = +new Date()
            scatter.keyChain.updateOrInsertPermission(p)
        }
        scatter.storage()
    }

    /**
     * 请求签名
     * @param payload payload
     * @param response response 
     */
    async requestSign(payload: any, response: (result: string | CustomError) => void) {
        const scatter = await StorageHelper.getScatter()
        const { domain, network } = payload
        const permission = scatter.keyChain.permissions.find(p =>
            p.contract === null
            && p.action === null
            && p.domain === domain)
        const signArgs = payload.signArgs as ISignProviderParams
        const { message } = signArgs
        const isWhiteList = message.every(msg => {
            return scatter.keyChain.isInWhiteList({
                contract: msg.code,
                action: msg.type,
                domain: domain
            })
        })
        if (isWhiteList) {
            const sign = this.sign(permission, scatter, signArgs.buf)
            if (sign) {
                response(sign)
                return
            }
        }

        NotificationHelper.openWindow(new Prompt(
            ConstKeys.FO_REQUEST_SIGN,
            domain,
            network,
            signArgs,
            (resp: any) => {
                if (resp.type === 'cancel') {
                    response(UtilsHelper.createError(ErrorCodeEnum.sign, 'User rejected the signature request'))
                } else {
                    const sign = this.sign(permission, scatter, signArgs.buf)
                    response(sign)
                    if (resp.white) {
                        this.addWhiteList(permission, scatter, domain, message)
                    }
                }
            },
            scatter
        ))
    }

    /**
     * 忘记身份
     * @param payload payload
     * @param response response
     */
    async forgetIdentity(payload: any, response: (result: boolean) => void) {
        if (this.locked) {
            response(false)
            return
        }
        const scatter = await StorageHelper.getScatter()
        const permission = scatter.keyChain.permissions.find(perm => perm.isIdentityOnly() && perm.domain === payload.domain)
        if (!permission) {
            response(false)
            return
        }
        const { permissions, signatures, identitys } = scatter.keyChain
        const identity = identitys.find(e => e.publicKey === permission.publicKey)
        if (identity) {
            for (let i = 0; i < signatures.length; i++) {
                const _signature = signatures[i]
                if (_signature.hex === UtilsHelper.signatureHex(identity.publicKey, payload.domain)) {
                    scatter.keyChain.signatures.splice(i, 1)
                    break
                }
            }
        }
        for (let i = permissions.length - 1; i > -1; i--) {
            const _permission = permissions[i]
            if (_permission.publicKey === permission.publicKey) {
                scatter.keyChain.permissions.splice(i, 1)
            }
        }
        scatter.storage()
        response(true)
    }

    /**
     * 签名
     * @param payload payload
     * @param response response
     */
    async requestAttributeSign(payload: any, response: (result: string | CustomError) => void) {
        if (this.locked) {
            response(null)
            return
        }
        const scatter = await StorageHelper.getScatter()
        const { domain, network, publicKey, data } = payload
        const identity = scatter.keyChain.identitys.find(identity => identity.publicKey === publicKey)
        const account = scatter.keyChain.findAccountsWithPublicKey(publicKey)
        if (!identity && !account) {
            response(UtilsHelper.createError(ErrorCodeEnum.sign, 'user rejected the signature request'))
            return
        }
        NotificationHelper.openWindow(new Prompt(
            ConstKeys.REQUEST_ATTRIBUTE_SIGN,
            domain,
            network,
            payload,
            (resp: any) => {
                if (resp.accept) {
                    function stringToUint8Array(str: string) {
                        var arr = [];
                        for (var i = 0, j = str.length; i < j; ++i) {
                            arr.push(str.charCodeAt(i));
                        }
                        var tmpUint8Array = new Uint8Array(arr);
                        return tmpUint8Array
                    }
                    const permission = scatter.keyChain.permissions.find(p =>
                        p.contract === null
                        && p.action === null
                        && p.domain === domain)
                    response(this.sign(permission, scatter, stringToUint8Array(data)))
                } else {
                    response(UtilsHelper.createError(ErrorCodeEnum.sign, 'user rejected the signature request'))
                }
            },
            scatter
        ))
    }

    loadData(): Promise<FOScatter> {
        return StorageHelper.getScatter()
    }
}

new Background()