export default class NetworkSession {
    public readonly type: string
    public readonly payload: any
    public readonly resolveId: string
    public readonly domain: string

    constructor(_type: string = '', _payload: any = '', _resolveId: string = '', _domain: string = '') {
        this.type = _type
        this.payload = _payload
        this.resolveId = _resolveId
        this.domain = _domain
    }

    static generate(): NetworkSession {
        return new NetworkSession()
    }

    static deserialize(json: { [key: string]: any }): NetworkSession {
        return Object.assign(this.generate(), json)
    }

    respond(payload: any) : NetworkSession{
        return new NetworkSession(this.type, payload, this.resolveId, this.domain)
    }

    error(payload: any): NetworkSession {
        return new NetworkSession('error', payload, this.resolveId,  this.domain)
    }
    
}