/**
 * toast 持续时长
 */
export const kToastDurtion: number = 2

/**
 * 密码最低长度
 */
export const kPasswordLen: number = 8

/**
 * 创建账户的正则
 */
export const kAccountNameRegex: RegExp = /^[a-z1-5]{12}$/

/**
 * 默认签名的过期时间 (毫秒) 5天
 */
export const kDefaultExp: number = 5 * 60 * 1000 // 5 * 24 * 60 * 60 * 1000

/**
 * fibos 链id
 */
export const kFibosChainId: string = 'FIBOSCHAINID'

/**
 * tracker 中心化url
 */
export const kFOApi: string = 'SERVICE_URL'


/**
 * name:默认链的名称
 */
export const chain_name: string = 'CHAIN_NAME'

/**
 * name:默认链的协议
 */
export const chain_protocol: string = 'CHAIN_PROTOCOL'

/**
 * name:默认链的 host 地址
 */
export const chain_host: string = 'CHAIN_HOST'

/**
 * name:默认链的端口
 */
export const chain_port: number = CHAIN_PORT

/**
 * name:默认chainid
 */
export const chain_chainId: string = 'CHAIN_CHAINID'

/**
 * name:创建账户服务
 */
export const create_tunnel: string = 'CREATE_TUNNEL'