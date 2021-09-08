import { ISettingState, ISettingAction } from '../reducer/setting'
import Network from '../models/Network'

/**
 * 初始化setting
 * @param payload 参数
 */
export function initKV(payload: ISettingState): ISettingAction {
    return {
        type: 'ST/INIT',
        payload,
    }
}

/**
 * 更新kv
 * @param key key
 * @param value value
 */
export function updateKV(key: string, value: any): ISettingAction {
    return {
        type: 'ST/UPDATE_KV',
        payload: {
            key,
            value
        }
    }
}

/**
 * 添加网络
 * @param network 网络
 */
export function addNetwork(network: Network): ISettingAction {
    return {
        type: 'ST/ADD_NETWORK',
        payload: network
    }
}

/**
 * 删除网络
 * @param network 网络
 */
export function delNetwork(network: Network): ISettingAction {
    return {
        type: 'ST/DEL_NETWORK',
        payload: network
    }
}