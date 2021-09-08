import Network from './Network'
import { LanguageEnum } from '../models/Enum'

export default class Setting {
  /**
   * 钱包是否锁定
   */
  public locked: boolean = false

  /**
   * 插件密码
   */
  public password: string = ""

  /**
   * 网络
   */
  public networks: Array<Network> = []
  /**
   * 语言环境
   */
  public language: LanguageEnum = LanguageEnum.chinese

  /**
   * 是否已经创建过账号
   */
  public created: boolean = false

  /**
   * 构造Model
   * @param locked 是否锁定
   * @param networks 网络
   * @param language 语言
   * @param password 密码
   */
  constructor(locked: boolean = false, networks: Array<Network> = [],
    language: LanguageEnum = LanguageEnum.chinese, password: string = '', created: boolean = false) {
    this.locked = locked
    this.networks = networks
    this.language = language
    this.password = password
    this.created = created
  }

  static generate(): Setting {
    return new Setting()
  }


  static deserialize(json: { [key: string]: any }): Setting {
    const p = Object.assign(new Setting(), json)
    if (json.hasOwnProperty('networks'))
      p.networks = json.networks.map((e: { [key: string]: any }) => Network.deserialize(e))
    return p
  }

}