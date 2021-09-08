import Network from './Network'
import * as ConstKeys from '../constKeys/ConstKeys'
import FOScatter from './FOScatter'

export default class Prompt {
    public readonly type: string
    public readonly domain: string
    public readonly network: Network
    public readonly data: { [key: string]: any }
    public readonly responder: any
    public readonly scatter: FOScatter

    constructor(
        _type: string = '', 
        _domain: string = '',
        _network: Network = null,
        _data: { [key: string]: any } = {},
        _responder: any = null,
        _scatter: FOScatter = null
    ) {
        this.type = _type
        this.domain = _domain
        this.network = _network
        this.data = _data
        this.responder = _responder
        this.scatter = _scatter
    }

    static generate(): Prompt {
        return new Prompt()
    }

    /**
   * json 2 model
   * @param json json
   */
    static deserialize(json: { [key: string]: any }): Prompt {
        const parsed = Network.deserialize(json.network || {})
        return Object.assign(Prompt.generate(), json, { network: parsed })
    }

    /**
     * model 2 string
     */
    public serialize(): string {
        return JSON.stringify(this)
    }

    public prefixName(): string {
        return `${ConstKeys.kPromptPrefix}${this.type}`
    }
}