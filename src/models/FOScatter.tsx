import Keychain from './Keychain'
import RandomFactory from '../utils/RandomFactory'
import Setting from './Setting'
import StorageHelper from '../utils/StorageHelper'
import UtilsHelper from '../utils/UtilsHelper'
import Permission from './Permission'

export default class FOScatter {
    public keyChain: Keychain
    public hash: string = RandomFactory.string(64).toLowerCase()
    public setting: Setting


    constructor() {
        this.keyChain = Keychain.generate()
        this.setting = Setting.generate()
    }

    public static generate(): FOScatter {
        return new FOScatter()
    }

    static deserialize(json: { [key: string]: any }): FOScatter {
        const p = Object.assign(this.generate(), json)
        if (json.hasOwnProperty('keyChain'))
            p.keyChain = Keychain.deserialize(json.keyChain)
        if (json.hasOwnProperty('setting'))
            p.setting = Setting.deserialize(json.setting)
        return p
    }

    public storage(): Promise<void> {
        return StorageHelper.save<FOScatter>(UtilsHelper.getScatterKey(), this)
    }

    public serialize() : string {
        return JSON.stringify(this)
    }
}