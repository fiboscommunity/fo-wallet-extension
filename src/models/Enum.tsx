import UtilsHelper from '../utils/UtilsHelper'

export enum ProtocolEnum {
  http,
  https,
  ws
}

export function stringToProtocolEnum(str: string): ProtocolEnum {
  var map: {[key: string]: number} = {}
  for (let entry in ProtocolEnum) {
    let val = parseInt(entry, 10)
    if (val >= 0) {
      map[ProtocolEnum[val].toLowerCase()] = val
    }
  }
  const lowerd = str.toLowerCase()
  if (map[lowerd] === undefined)
  UtilsHelper.createError(ErrorCodeEnum.props_parsed_error, `[ProtocolEnum] parse string [${str}] error`)
  return map[lowerd]
}

export enum LanguageEnum {
  chinese,
  english
}


export enum ErrorCodeEnum {
  /**
   * 子类未重写父类方法
   */
  method_unoverride = 1000,
  /**
   * 属性转换失败
   */
  props_parsed_error,
  /**
   * 网络
   */
  network,
  /**
   * 参数错误
   */
  params_error,
  /**
   * 使用了禁用的属性
   */
  params_forbid,
  /**
   * 插件
   */
  plugin,
  /**
   * 版本
   */
  version,
  /**
   * 身份
   */
  identity,
  /**
   * 弹框
   */
  prompt,
  /**
   * 加密
   */
  encrypt,
  /**
   * 签名
   */
  sign
}

