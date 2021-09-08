import Plugin from './Plugin'
import { ErrorCodeEnum, ProtocolEnum } from '../models/Enum'
import FIBOS from './plugin/fibos'
import UtilsHelper from '../utils/UtilsHelper'
import Network from '../models/Network'
import NetworkCustom from '../models/NetworkCustom'
import apis from '../utils/ApiHelper'
import FOScatter from '../models/FOScatter'
import { kFIBOS } from '../constKeys/ConstKeys'

class PluginFactory {
    public readonly plugins: Array<Plugin> = []
    constructor() {
        this.plugins = []
        this.registPlugin()
    }

    /**
     * 注册插件
     */
    public registPlugin() {
        this.plugins.push(new FIBOS())
        if (apis.storage && apis.storage.local) {
            const key = UtilsHelper.getScatterKey()
            apis.storage.local.get(key, (val: any) => {
                const v = val[key]
                if (!v)
                    return
                const scatter = FOScatter.deserialize(v)
                scatter.setting.networks.forEach((network: NetworkCustom) => {
                    if (network.prefix) {
                        const plugin = new Plugin(network.blockchain, network.prefix)
                        plugin.getEndorsedNetwork = function(): Network {
                            return network
                        }
                        this.plugins.push(plugin)
                    }
                })
            })
        }
    }

    /**
     * 查找插件
     * @param name 插件名称
     */
    public async plugin(name: string): Promise<Plugin> {
        return new Promise(resolve => {
            let plugin = this.plugins.find(plugin => plugin.name === name)
            if (plugin) {
                resolve(plugin)
                return
            }
            setTimeout(() => {
                plugin = this.plugins.find(plugin => plugin.name === name)
                if (plugin) {
                    resolve(plugin)
                    return
                }
                throw UtilsHelper.createError(ErrorCodeEnum.plugin, 'no plugin found')
            }, 1000)
        })
    }

    public basePlugin(): Plugin {
        let plugin = this.plugins.find(plugin => plugin.name === kFIBOS)
        if (plugin)
            return plugin
        throw UtilsHelper.createError(ErrorCodeEnum.plugin, 'no plugin found')
    }

    /**
     * 热加载插接件网络配置
     * @param networks 
     */
    public hotPlugin(networks: Array<Network>): void {
        networks.forEach((network: NetworkCustom) => {
            if (network.prefix) {
                const plugin = new Plugin(network.blockchain, network.prefix)
                plugin.getEndorsedNetwork = function(): Network {
                    return network
                }
                this.plugins.push(plugin)
            }
        })
    }

    /**
     * 查找可用的插件
     */
    public signatureProviders(): Array<Plugin> {
        return this.plugins
    }
}

export default new PluginFactory()