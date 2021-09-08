import { EncryptedStream } from 'extension-streams'
import PluginFactory from '../plugins/PluginFactory'
import Network from '../models/Network'
import UtilsHelper from './UtilsHelper'
import { ErrorCodeEnum } from '../models/Enum'
import * as ConstKeys from '../constKeys/ConstKeys'
import Identity from '../models/Identity'
import RandomFactory from './RandomFactory'
import NetworkSession from './NetworkSession'
import Resolver from './Resolver'

export interface IFODAppOptions {
    version: string
    identity: any
}

let stream: typeof EncryptedStream = null
let requiredVersion: string = '0.0.0'
let resolvers: { [key: string]: Resolver } = {}
let publicKey: string = ''

export default class FODApp {
    private version: string = ''
    private identity: Identity = null

    constructor(_stream: typeof EncryptedStream, _option: IFODAppOptions) {
        this.version = _option.version
        this.setUpIdentity(_option.identity)
        stream = _stream
        resolvers = {}
        this.initPluginSigProvider()
        this.addObserver()
    }

    addObserver() {
        stream.listenWith((msg: any) => {
            if (!msg || !msg.hasOwnProperty('type')) return false
            const resolver = resolvers[msg.resolveId]
            if (resolver) {
                if (msg.type === 'error')
                    resolver.reject(msg.payload)
                else
                    resolver.resolve(msg.payload)
                delete resolvers[msg.id]
            }
        })
    }


    /**
     * 发送消息
     * @param type 类别
     * @param payload 消息体
     */
    msgSender(type: string, payload: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (UtilsHelper.compareVersion(this.version, requiredVersion)) {
                throw UtilsHelper.createError(ErrorCodeEnum.version, 'please update crx version')
            }
            const id = RandomFactory.number(24)
            const session = new NetworkSession(type, payload, id)
            const resolver = new Resolver(id, resolve, reject)
            resolvers[id] = resolver
            stream.send(session, ConstKeys.FO_STREAM)
        })
    }

    /**
     * 如果没有公钥，则抛错
     */
    throwIfNoIdentity(): void {
        if (!publicKey || publicKey.length <= 0)
            throw UtilsHelper.createError(ErrorCodeEnum.identity, 'no identity was found')
    }

    /**
     * 设置身份
     * @param identity_ 身份
     */
    private setUpIdentity(identity_: Identity): void {
        this.identity = identity_
        publicKey = this.identity ? this.identity.publicKey : ''
    }

    /**
     * 添加网络
     * @param network 网络
     */
    public suggestNetwork(network: { [key: string]: any }): Promise<any> {
        const parsed = Network.deserialize(network)
        if (!parsed || !parsed.isValid())
            throw UtilsHelper.createError(ErrorCodeEnum.network, 'network invalid')
        return this.msgSender(ConstKeys.ADD_NETWORK, { network: parsed })
    }

    /**
     * 获取身份
     * @param field 
     */
    public getIdentity(fields: { [key: string]: any }): Promise<Identity> {
        return this.msgSender(ConstKeys.GET_REQUEST_IDENTITY, { fields })
            .then(async (identity: Identity) => {
                this.setUpIdentity(identity)
                return identity
            })
    }

    /**
     * 获取did身份
     * @param fields 
     */
    public requestIdentity(fields: { [key: string]: any }): Promise<Identity> {
        fields.accounts = [{}]
        return this.msgSender(ConstKeys.GET_REQUEST_IDENTITY, { fields })
            .then(async (identity: Identity) => {
                this.setUpIdentity(identity)
                return identity
            })
    }

    /**
     * 指定版本
     * @param version 版本
     */
    public requireVersion(version: string) {
        requiredVersion = version
    }

    /**
     * 描述签名
     * @param publicKey 公钥
     * @param data 代签数据
     * @param whatfor ''
     * @param isHash 是否hash
     */
    public getArbitrarySignature(publicKey: string, data: any, whatfor: string = '', isHash: boolean = false) {
        return this.msgSender(ConstKeys.REQUEST_ATTRIBUTE_SIGN, {
            publicKey,
            data,
            whatfor,
            isHash
        })
    }

    /**
     * 忘记身份
     */
    public forgetIdentity() {
        this.throwIfNoIdentity()
        return this.msgSender(ConstKeys.FORGET_IDENTITY, {})
            .then(() => {
                this.identity = null
                publicKey = null
                return true
            })
    }

    /**
     * 刷新身份
     * @param fields 
     */
    public refreshIdentity(fields: { [key: string]: any }) {
        return this.msgSender(ConstKeys.REFRESH_IDENTITY, { fields })
            .then(async (identity: Identity) => {
                this.setUpIdentity(identity)
                return identity
            })
            .catch(() => {
                this.setUpIdentity(null)
                return null
            })
    }

    /**
     * 初始化插件signatureProvider
     */
    initPluginSigProvider(): void {
        PluginFactory.signatureProviders().forEach(plugin => {
            let ctx: any = this
            const name = plugin.name
            ctx[name] = plugin.signatureProvider(this.msgSender, this.throwIfNoIdentity)
        })
    }

    /**
     * 热加载插件
     * @param networks 网络
     */
    hotPlugin(networks: Array<Network>): void {
        PluginFactory.hotPlugin(networks)
        this.initPluginSigProvider()
    }
}