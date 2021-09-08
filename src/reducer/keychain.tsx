import Keypair from '../models/Keypair'
import Identity from '../models/Identity'
import Permission from '../models/Permission'

export interface IKeyChainState {
    keypairs: Array<Keypair>
    identitys: Array<Identity>
    permissions: Array<Permission>
}

export type IKeyChainActionType = 'KC/INIT' | 'KC/UPDATE_KV' | 'KC/ADD_IDENTITY' | 'KC/ADD_KEYPAIR' | 'KC/DEL_IDENTITY' | 'KC/DEL_KEYPAIR' | 'KC/REVOKE_AUTHOR' | 'KC/REVOKE_CONTRACT'

export interface IKeyChainAction {
    type: IKeyChainActionType
    payload: { [key: string]: any }
}

const initState: IKeyChainState = {
    keypairs: [],
    identitys: [],
    permissions: []
}

export default function keychain(state: IKeyChainState = initState, action: IKeyChainAction): IKeyChainState {
    let tmp: any = null
    let tmp2: any = null
    switch (action.type) {
        case 'KC/INIT':
            return {
                ...state,
                ...action.payload
            }
        case 'KC/UPDATE_KV':
            return {
                ...state,
                [action.payload.key]: action.payload.value
            }
        case 'KC/ADD_KEYPAIR':
            tmp = [...state.keypairs]
            tmp2 = action.payload as Keypair
            if (tmp.find((e: Keypair) => e.unique() === tmp2.unique())) {
                return state
            }
            tmp.push(tmp2)
            return {
                ...state,
                keypairs: tmp
            }
        case 'KC/DEL_KEYPAIR':
            tmp = [...state.keypairs]
            tmp2 = action.payload as Keypair
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i].unique() === tmp2.unique()) {
                    tmp.splice(i, 1)
                    break
                }
            }
            return {
                ...state
            }
        case 'KC/ADD_IDENTITY':
            tmp = [...state.identitys]
            tmp2 = action.payload as Identity
            if (tmp.find((e: Identity) => e.hashStr() === tmp2.hashStr())) {
                return state
            }
            tmp.push(tmp2)
            return {
                ...state,
                identitys: tmp
            }
        case 'KC/DEL_IDENTITY':
            tmp = [...state.identitys]
            tmp2 = action.payload as Identity
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i].hashStr() === tmp2.hashStr()) {
                    tmp.splice(i, 1)
                    for (let j = state.permissions.length - 1; j >= 0; j--) {
                        if (state.permissions[j].publicKey === tmp2.publicKey) {
                            state.permissions.splice(j, 1)
                        }
                    }
                    break
                }
            }
            return {
                ...state,
                identitys: tmp
            }
        case 'KC/REVOKE_AUTHOR':
            tmp = [...state.permissions]
            tmp2 = action.payload as Permission
            for (let i = state.permissions.length - 1; i >= 0; i--) {
                if (tmp[i].publicKey === tmp2.publicKey
                    && tmp[i].domain === tmp2.domain) {
                    tmp.splice(i, 1)
                }
            }
            return {
                ...state,
                permissions: tmp
            }
        case 'KC/REVOKE_CONTRACT':
            tmp = [...state.permissions]
            tmp2 = action.payload as Permission
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i].publicKey === tmp2.publicKey
                    && tmp[i].domain === tmp2.domain
                    && tmp[i].contract === tmp2.contract
                    && tmp[i].action === tmp2.action) {
                    tmp.splice(i, 1)
                    break
                }
            }
            return {
                ...state,
                permissions: tmp
            }
        default:
            return state
    }
}