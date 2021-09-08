import { ProtocolEnum, stringToProtocolEnum } from './Enum'
import { kFIBOS } from '../constKeys/ConstKeys'

export interface INetWork {
  name?: string
  protocol: ProtocolEnum
  host: string
  port: number
  blockchain: string
  chainId: string
}

export default class Network {
  public readonly name: string
  public readonly protocol: ProtocolEnum
  public readonly host: string
  public readonly port: number
  public readonly blockchain: string
  public readonly chainId: string

  constructor(props: INetWork) {
    this.name = props.name || ''
    this.protocol = props.protocol
    this.host = props.host
    this.port = props.port
    this.blockchain = props.blockchain
    this.chainId = props.chainId
  }

  /**
   * 构造一个空的实例
   */
  static generate(): Network {
    return new Network({
      name: '',
      protocol: ProtocolEnum.http,
      host: '',
      port: 80,
      blockchain: '',
      chainId: ''
    })
  }

  /**
   * json 2 model
   * @param json json
   */
  static deserialize(json: { [key: string]: any } = {}): Network {
    const next = { ...json }
    if (next.hasOwnProperty('protocol')) {
      if (isNaN(parseInt(next.protocol, 10)))
      next.protocol = stringToProtocolEnum(next.protocol)
    }
    return Object.assign(Network.generate(), next)
  }

  /**
   * model 2 string
   */
  public serialize(): string {
    return JSON.stringify(this)
  }

  /**
   * unique 2 model
   * @param str 
   */
  static fromUnique(str: string): Network {
    const splits = str.split('-:-')
    if (splits.length !== 6)
      return Network.generate()
    return new Network({
      name: splits[0],
      protocol: parseInt(splits[1]),
      host: splits[2],
      port: parseInt(splits[3]),
      blockchain: splits[4],
      chainId: splits[5]
    })
  }

  /**
   * unique string
   */
  public unique(): string {
    let str = `${this.name}-:-${this.protocol}-:-${this.host}-:-${this.port}-:-${this.blockchain}-:-${this.chainId}`
    return str.toLowerCase()
  }

  public unique2(): string {
    let str = `${this.blockchain}:${this.chainId}`
    return str.toLowerCase()
  }


  /**
   * url
   */
  public hostport(): string {
    return `${this.host}:${this.port}`
  }

  /**
   * 复制一份
   */
  public clone(): Network {
    let json = JSON.parse(JSON.stringify(this))
    return Network.deserialize(json)
  }

  /**
   * 是否是空的
   */
  public isEmpty(): boolean {
    return !this.host.length
  }

  /**
   * 这个实例是否有效
   */
  public isValid(): boolean {
    return this.host.length > 0 || this.chainId.length > 0
  }
}