import Plugin from '../Plugin'
import { ProtocolEnum } from '../../models/Enum'
import Network from '../../models/Network'
import EncryptHelper from '../../utils/EncryptHelper'
import RandomFactory from '../../utils/RandomFactory'
import { kFIBOS } from '../../constKeys/ConstKeys'
import { chain_name, chain_protocol, chain_host, chain_port, chain_chainId, create_tunnel } from '../../config'

export default class FIBOS extends Plugin {
    private tunnel: string = create_tunnel

    constructor() {
        super(kFIBOS, 'FO')
    }

    public getEndorsedNetwork(): Network {
        return new Network({
            name: chain_name,
            protocol: chain_protocol,
            host: chain_host,
            port: chain_port,
            blockchain: this.name,
            chainId: chain_chainId
        })
    }

    /**
     * 系统创建账户
     * @param name 账户名
     * @param publicKey 公钥
     */
    public createAccountBySystem(name: string, publicKey: string): Promise<boolean> {
        const array = [1, 2, 3, 4, 5, 6] // need change
        const salt = RandomFactory.createSalt(array)
        const t = +new Date()
        const str = `${name}${publicKey}${salt}${t}`
        const hash = EncryptHelper.md5(str)
        return new Promise((resolve, reject) => {
            fetch(this.tunnel, {
                method: "POST",
                body: JSON.stringify({
                    account: name,
                    pubkey: publicKey,
                    hash,
                    t,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(r => r.json())
                .then(json => {
                    if (!json)
                        reject()
                    else if (json.message === 'success')
                        resolve(true)
                    else
                        reject()
                })
                .catch(e => reject())
        })
    }
}