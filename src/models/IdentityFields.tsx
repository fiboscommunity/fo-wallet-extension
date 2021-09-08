import Network from '../models/Network'

export class IdentityFields {
    public accounts: Array<Network> = []

    constructor(_account: Array<Network> = []) {
        this.accounts = _account
    }

    static generate(): IdentityFields {
        return new IdentityFields()
    }

    static deserialize(json: { [key: string]: any } = {}): IdentityFields {
        const p = Object.assign(IdentityFields.generate(), json)
        p.accounts = json.hasOwnProperty('accounts') ? json.accounts.map(Network.deserialize) : []
        return p
      }
}