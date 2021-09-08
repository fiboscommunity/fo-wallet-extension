import Network, { INetWork } from "./Network"

interface INetworkCustom extends INetWork {
    prefix: string
}

export default class NetworkCustom extends Network {
    public readonly prefix: string

    constructor(props: INetworkCustom) {
        super({
            name: props.name,
            protocol: props.protocol,
            host: props.host,
            port: props.port,
            blockchain: props.blockchain,
            chainId: props.chainId
        })
        this.prefix = props.prefix
      }
}