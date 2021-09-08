import { IKeyChainAction, IKeyChainState } from '../reducer/keychain'
import Keypair from '../models/Keypair'
import Identity from '../models/Identity'
import Permission from '../models/Permission'

/**
 * 初始化keychain
 * @param payload 参数
 */
export function initKV(payload: IKeyChainState): IKeyChainAction {
    return {
        type: 'KC/INIT',
        payload,
    }
}

/**
 * 更新kv
 * @param key key
 * @param value value
 */
export function updateKV(key: string, value: any): IKeyChainAction {
    return {
        type: 'KC/UPDATE_KV',
        payload: {
            key,
            value
        }
    }
}

/**
 * 添加秘钥对
 * @param keypair 秘钥对
 */
export function addKeypair(keypair: Keypair): IKeyChainAction {
    return {
        type: 'KC/ADD_KEYPAIR',
        payload: keypair
    }
}

/**
 * 删除秘钥对
 * @param keypair 秘钥对
 */
export function delKeypair(keypair: Keypair): IKeyChainAction {
    return {
        type: 'KC/DEL_KEYPAIR',
        payload: keypair
    }
}

/**
 * 添加身份
 * @param identity 身份
 */
export function addIdentity(identity: Identity): IKeyChainAction {
    return {
        type: 'KC/ADD_IDENTITY',
        payload: identity
    }
}

/**
 * 移除身份
 * @param identity 身份
 */
export function delIdentity(identity: Identity): IKeyChainAction {
    return {
        type: 'KC/DEL_IDENTITY',
        payload: identity
    }
}

/**
 * 删除授权
 * @param permission 
 */
export function revokeAuthor(permission: Permission): IKeyChainAction {
    return {
        type: 'KC/REVOKE_AUTHOR',
        payload: permission
    }
}

/**
 * 撤销合约
 * @param permission 
 */
export function revokeContract(permission: Permission): IKeyChainAction {
    return {
        type: 'KC/REVOKE_CONTRACT',
        payload: permission
    }
}