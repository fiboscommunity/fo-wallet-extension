import Network from '../models/Network'

export interface ICreateState {
    network: number
    name: string
    privateKey: string
}

export type ICreateActionType = 'CT/UPDATE_KV' | 'CT/CLEAR'

export interface ICreateAction {
    type: ICreateActionType
    payload: { [key: string]: any }
}

const initState: ICreateState = {
    network: 0,
    name: '',
    privateKey: ''
}


export default function create(state: ICreateState = initState, action: ICreateAction): ICreateState {
    switch (action.type) {
        case 'CT/UPDATE_KV':
            return {
                ...state,
                [action.payload.key]: action.payload.value
            }
        case 'CT/CLEAR':
            return {
                ...initState
            }
        default:
            return state
    }
}