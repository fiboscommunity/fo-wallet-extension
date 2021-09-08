import Network from '../models/Network'
import { LanguageEnum } from '../models/Enum'

export interface ISettingState {
    locked: boolean
    password: string
    networks: Array<Network>
    language: LanguageEnum
    created: boolean
}

export type ISettingActionType = 'ST/INIT' | 'ST/UPDATE_KV' | 'ST/ADD_NETWORK' | 'ST/DEL_NETWORK'

export interface ISettingAction {
    type: ISettingActionType
    payload: { [key: string]: any }
}

const initState: ISettingState = {
    locked: false,
    password: '',
    networks: [],
    language: LanguageEnum.chinese,
    created: false // 是否已经执行过创建
}

export default function setting(state: ISettingState = initState, action: ISettingAction): ISettingState {
    let tmp: any = null
    let tmp2: any = null
    switch (action.type) {
        case 'ST/INIT':
            return {
                ...state,
                ...action.payload
            }
        case 'ST/UPDATE_KV':
            return {
                ...state,
                [action.payload.key]: action.payload.value
            }
        case 'ST/ADD_NETWORK':
            tmp = [...state.networks]
            tmp.push(action.payload as Network)
            return {
                ...state,
                networks: tmp
            }
        case 'ST/DEL_NETWORK':
            tmp = [...state.networks]
            tmp2 = action.payload as Network
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i].unique() === tmp2.unique()) {
                    tmp.splice(i, 1)
                    break
                }
            }
            return {
                ...state,
                networks: tmp
            }
        default:
            return state
    }
}