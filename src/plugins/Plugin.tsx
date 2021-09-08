import Fibos from 'fibos.js'
import { ProtocolEnum, ErrorCodeEnum } from '../models/Enum'
import Account from '../models/Account'
import Network from '../models/Network'
import Keypair from '../models/Keypair'
import {
    IAccountPermission, ISignProviderParams, IRequestParserParams, IRequestParserResponse,
    ISignProviderGroup,
} from './PluginModel'
import UtilsHelper from '../utils/UtilsHelper'
import { FO_REQUEST_SIGN } from '../constKeys/ConstKeys'
import { kFibosChainId, kFOApi } from '../config'

const { ecc } = Fibos.modules

type TProtocol = 'http' | 'https' | 'ws'

interface INetwork {
    blockchain: string
    chainId: string
    protocol?: TProtocol
}

interface IConfig {
    protocol: TProtocol
    port: number
    host: string
    chainId: string
}

interface IAccount {
    id: string
}

interface IPermission {
    permission: string
    account: IAccount
}

interface IFIBOSPermission {
    find_fibos_permissions: Array<IPermission>
}

interface IQueryAccount {
    data: IFIBOSPermission
}

export default class Plugin {
    public readonly name: string
    public readonly keyPrefix: string
    constructor(_name: string, _keyPrefix: string) {
        this.name = _name
        this.keyPrefix = _keyPrefix
    }

    /**
     * 账户格式化
     */
    public formatter(account: Account) {
        return `${account.name}@${account.authority}`
    }

    /**
     * 简化账户
     * @param account 
     */
    public returnableAccount(account: Account): IAccountPermission {
        return {
            name: account.name,
            authority: account.authority
        }
    }

    /**
     * 配置插件的网络
     */
    public getEndorsedNetwork(): Network {
        throw UtilsHelper.createError(ErrorCodeEnum.method_unoverride, 'method [getEndorsedNetwork] must be override')
    }

    /**
     * 根据名字获取账户名
     * @param name 名字
     * @param network 网络
     */
    public checkAccountExist(name: string, network: Network): Promise<boolean> {
        return new Promise((resolve) => {
            const fibos = Fibos({ httpEndpoint: `${ProtocolEnum[network.protocol]}://${network.hostport()}` })
            fibos.getAccount(name)
                .then((resp: any) => {
                    if (resp)
                        resolve(true)
                    else
                        resolve(false)
                })
                .catch((ex: Error) => {
                    // 由于没有找到账户也是报错，所以需要根据错误信息是不是对象判断 存不存在
                    try {
                        JSON.parse(ex.message)
                        resolve(false)
                    } catch (e) {
                        resolve(true)
                    }
                })
        })
    }

    /**
     * 根据公用查找账户
     * @param publicKey 公钥
     * @param network 网络
     */
    protected async getAccountsFromPublicKey(publicKey: string, network: Network): Promise<Array<IAccountPermission>> {
        const accounts = await this.queryAccounts(publicKey, network)
        if (accounts.length > 0) {
            return Promise.resolve(accounts)
        }
        return new Promise((resolve) => {
            const fibos = Fibos({ httpEndpoint: `${ProtocolEnum[network.protocol]}://${network.hostport()}` })
            fibos.getKeyAccounts(publicKey).then((res: any) => {
                if (!res || !res.hasOwnProperty('account_names')) {
                    resolve([])
                    return
                }
                Promise.all(res.account_names.map((name: string) => fibos.getAccount(name).catch(() => resolve([]))))
                    .then(multires => {
                        let accounts: Array<IAccountPermission> = []
                        multires.forEach((account: any) => {
                            account.permissions.forEach((permission: any) => {
                                accounts.push({ name: account.account_name, authority: permission.perm_name })
                            })
                        })
                        resolve(accounts)
                    }).catch(() => resolve([]))
            }).catch(() => resolve([]))
        })
    }

    /**
     * 构造schema
     * @param publicKey 
     */
    private schema(publicKey: string): string {
        return `
        {
            find_fibos_permissions(
              where: {
                pub_key: "${publicKey}"
              }
            ) {
              permission,
              account{
                id
              }
            }
          }
        `
    }

    /**
     * 通过fibos_account 查询账户
     * @param publicKey 
     * @param network 
     */
    private async queryAccounts(publicKey: string, network: Network): Promise<Array<IAccountPermission>> {
        if (network.chainId === kFibosChainId) {
            return new Promise((resolve, reject) => {
                fetch(kFOApi, {
                    method: "POST",
                    body: this.schema(publicKey),
                    headers: {
                        'Content-Type': 'application/graphql',
                    },
                })
                    .then(r => r.json())
                    .then((json: IQueryAccount) => {
                        const { data: { find_fibos_permissions } } = json
                        const accounts: Array<IAccountPermission> = []
                        find_fibos_permissions.forEach(elem => {
                            accounts.push({
                                name: elem.account.id,
                                authority: elem.permission
                            })
                        })
                        resolve(accounts)
                    })
                    .catch(() => resolve([]))
            })
        }
        return Promise.resolve([])
    }

    /**
     * 根据键值对和网络查找账户
     * @param keypair 
     * @param network 
     * @param callback 
     */
    public async importAccount(keypair: Keypair, network: Network, callback?: (accounts: Array<Account>) => void): Promise<Array<Account>> {
        const accounts = await this.getAccountsFromPublicKey(keypair.publicKey, network)
        const parsed = accounts.map(account => Account.deserialize({
            name: account.name,
            authority: account.authority,
            publicKey: keypair.publicKey,
            keypairUnique: keypair.unique(),
        }))
        if (callback) {
            callback(parsed)
        }
        return Promise.resolve(parsed)
    }

    /**
     * 私钥专公钥
     * @param privateKey 私钥
     */
    public privateToPublic(privateKey: string): string {
        return ecc.privateToPublic(privateKey, this.keyPrefix)
    }

    /**
     * 检测私钥是否合法
     * @param privateKey 私钥
     */
    public validPrivateKey(privateKey: string): boolean {
        return ecc.isValidPrivate(privateKey)
    }

    /**
     * 检测公钥是否合法
     * @param publicKey 公钥
     */
    public validPublicKey(publicKey: string): boolean {
        return ecc.isValidPublic(publicKey, this.keyPrefix)
    }

    /**
     * 生成随机的私钥
     */
    public randomPrivateKey(): Promise<string> {
        return ecc.randomKey()
    }

    /**
     * 系统创建账户
     * @param name 账户名
     * @param publicKey 公钥
     */
    public createAccountBySystem(name: string, publicKey: string): Promise<boolean> {
        throw UtilsHelper.createError(ErrorCodeEnum.method_unoverride, 'method [createAccountBySystem] must be override')
    }

    /**
     * 格式化请求参数
     * @param params 参数
     */
    private async requestParser(params: IRequestParserParams): Promise<Array<IRequestParserResponse>> {
        const _fibos = params.fibos({
            httpEndpoint: params.httpEndpoint,
            chainId: params.chainId,
            keyPrefix: this.keyPrefix
        })
        const contractSet = new Set<string>()
        params.signargs.transaction.actions.forEach(action => contractSet.add(action.account))
        const contracts = Array.from(contractSet)
        const abis: { [key: string]: { [key: string]: any } } = {}
        await Promise.all(contracts.map(async contract => {
            const abiKey = UtilsHelper.getAbiKey(contract, params.chainId)
            let win: any = window
            const cachedAbi = win[abiKey] // 缓存中读取abi
            if (cachedAbi && Object.prototype.toString.call(cachedAbi) === '[object Object]'
                && cachedAbi.timestamp < +new Date()) {
                abis[contract] = _fibos.fc.abiCache.abi(contract, cachedAbi.abi)
            } else {
                abis[contract] = (await _fibos.contract(contract)).fc
                const toSave = JSON.parse(JSON.stringify(abis[contract]))
                delete toSave.schema
                delete toSave.structs
                delete toSave.types
                toSave.timestamp = +new Date((await _fibos.getAccount(contract)).last_code_update)
                win[abiKey] = toSave
            }
        }))
        return await Promise.all(params.signargs.transaction.actions.map(async action => {
            const contract = action.account
            let abi = abis[contract]
            const data = abi.fromBuffer(action.name, action.data)
            return {
                data,
                code: action.account,
                type: action.name,
                authorization: action.authorization,
            }
        }))
    }

    /**
     * 签名函数
     * @param signArgs 
     * @param fibos 
     * @param httpEndpoint 
     * @param chainId 
     * @param throwIfNoIdentity 
     */
    protected async signProvider(params: ISignProviderGroup): Promise<string> {
        params.throwIfNoIdentity()
        params.signArgs.message = await this.requestParser({
            fibos: params.fibos,
            signargs: params.signArgs,
            httpEndpoint: params.httpEndpoint,
            chainId: params.chainId
        })
        const domain = UtilsHelper.host(window)

        return params.send(FO_REQUEST_SIGN, {
            domain,
            network: params.network,
            signArgs: params.signArgs
        })
    }

    /**
     * 合约代理
     * @param result 
     */
    protected contractProxy(result: { [key: string]: any }): any {
        return new Proxy(result, {
            get(tar, method: string) {
                if (method === 'then')
                    return tar[method]
                return (...args: any[]) => {
                    return new Promise(async (resolve, reject) => {
                        tar[method](...args)
                            .then((result: any) => {
                                resolve(result)
                            })
                            .catch(reject)
                    })
                }
            }
        })
    }

    /**
     * 返回绑定在全局上下文的包装过的方法，用于客户端实例化
     * @param send 
     * @param throwIfNoIdentity 
     */
    public signatureProvider(send: (type: string, payload: any) => Promise<any>, throwIfNoIdentity: () => void) {
        return (network: INetwork, fibos: (args: { [key: string]: any }) => any, options: IConfig, protocol: TProtocol) => {
            if (!['http', 'https', 'ws'].includes(protocol.toLowerCase()))
                throw UtilsHelper.createError(ErrorCodeEnum.params_error, 'protocol must be either http, https, ws')
            if (!network.hasOwnProperty('protocol'))
                network.protocol = protocol
            const parsedNetwork = Network.deserialize(network)
            if (!parsedNetwork.isValid())
                throw UtilsHelper.createError(ErrorCodeEnum.network, 'must bind a netword')
            const httpEndpoint = `${ProtocolEnum[parsedNetwork.protocol]}://${parsedNetwork.hostport()}`
            const self = this
            return new Proxy(fibos({ httpEndpoint, chainId: options.chainId, keyPrefix: this.keyPrefix }), {
                get(tar, method) {
                    return (...args: any[]) => {
                        if (args.find(arg => arg.hasOwnProperty('keyProvider')))
                            throw UtilsHelper.createError(ErrorCodeEnum.params_forbid, 'forbid use keyProvider')
                        return new Promise((resolve, reject) => {
                            fibos(Object.assign(options, {
                                httpEndpoint,
                                signProvider: (argSign: ISignProviderParams) =>
                                    self.signProvider({
                                        signArgs: argSign,
                                        fibos,
                                        httpEndpoint,
                                        chainId: options.chainId,
                                        throwIfNoIdentity,
                                        send,
                                        network: parsedNetwork
                                    }),
                                keyPrefix: self.keyPrefix
                            }))[method](...args)
                                .then((result: { [key: string]: any }) => {
                                    if (!result.hasOwnProperty('fc')) {
                                        result = Object.assign(result)
                                        resolve(result)
                                        return
                                    }
                                    resolve(self.contractProxy(result))
                                })
                                .catch((err: Error) => reject(err))
                        })
                    }
                }
            })
        }
    }
}