import { combineReducers } from 'redux'
import keychain, {IKeyChainState } from './keychain'
import setting, { ISettingState } from './setting'
import create, { ICreateState} from './create'

export interface IStoreState {
    keychain: IKeyChainState
    setting: ISettingState
    create: ICreateState
}

export default combineReducers({
    keychain,
    setting,
    create
})
