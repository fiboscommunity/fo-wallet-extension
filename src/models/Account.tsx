import PluginFactory from '../plugins/PluginFactory'
import { kFIBOS } from '../constKeys/ConstKeys'

export default class Account {
    public keypairUnique: string
    public publicKey: string
    public name: string
    public authority: string

    constructor(keypairUnique: string = '', publicKey: string = '', name: string = '', authority: string = '') {
        this.keypairUnique = keypairUnique
        this.publicKey = publicKey
        this.name = name
        this.authority = authority
    }

    /**
     * 构造一个空的实例
     */
    static generate(): Account {
        return new Account()
    }

    /**
     * json 2 model
     * @param json json
     */
    static deserialize(json: { [key: string]: string }): Account {
        return Object.assign(Account.generate(), json)
    }

    /**
     * model 2 string
     */
    public serialize(): string {
        return JSON.stringify(this)
    }

    /**
     * 格式化
     */
    public formatted() {
        return`${this.name}@${this.authority}`
    }

    /**
     * 获取chain
     */
    public blockChain(): string {
        return this.keypairUnique.split(':')[0]
    }

}