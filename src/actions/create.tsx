import { ICreateAction } from '../reducer/create'

/**
 * 更新kv
 * @param key key
 * @param value value
 */
export function updateKV(key: string, value: any): ICreateAction {
    return {
        type: 'CT/UPDATE_KV',
        payload: {
            key,
            value
        }
    }
}

/**
 * 清除reducer
 */
export function clear(): ICreateAction {
    return {
        type: 'CT/CLEAR',
        payload: {}
    }
}