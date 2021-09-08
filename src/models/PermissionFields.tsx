import { kFIBOS } from "../constKeys/ConstKeys"

export class FiledAccount {
    public blockchain: string
    public chainId: string

    constructor(_blockchain: string = kFIBOS, _chainId: string = '') {
        this.blockchain = _blockchain
        this.chainId = _chainId
    }

    static deserialize(json: { [key: string]: any }): FiledAccount {
        const next = Object.assign({}, json)
        return Object.assign(new FiledAccount(), next)
    }

}

export class PermissionFields {
    public accounts: Array<FiledAccount> = []

    constructor(accounts: Array<FiledAccount> = []) {
        this.accounts = accounts
    }

    static deserialize(json: { [key: string]: any }): PermissionFields {
        const p = Object.assign(new PermissionFields(), json)
        if (json.hasOwnProperty('accounts'))
            p.accounts = json.accounts.map((e: { [key: string]: any }) => FiledAccount.deserialize(e))
        return p
    }
}