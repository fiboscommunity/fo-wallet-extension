import React, { Component } from "react"
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { History } from 'history'
import Toast from '../component/toast/index'
import { kToastDurtion, kPasswordLen } from '../../config/index'
import { LanguageEnum } from '../../models/Enum'
import { IStoreState } from '../../reducer/index'
import * as KeyChainActions from '../../actions/keychain'
import * as SettingActions from '../../actions/setting'
import StorageHelper from "../../utils/StorageHelper"
import LocalizationHelper from '../../localization/LocalizationHelper'

import FOScatter from "../../models/FOScatter"
import RandomFactory from "../../utils/RandomFactory"
import EncryptHelper from "../../utils/EncryptHelper"
import FOScatterInterface from '../../interface/Interface'
import PluginFactory from "../../plugins/PluginFactory"

interface IEntryProps {
    locked: boolean
    password: string
    language: LanguageEnum
    dispatch?: Dispatch
    history?: History
}

interface IEntryState {
    password: string
    passwordRepeat: string
}

class Entry extends Component<IEntryProps, IEntryState> {
    private keyChainAction: typeof KeyChainActions
    private settingAction: typeof SettingActions

    constructor(props: IEntryProps) {
        super(props)
        this.keyChainAction = bindActionCreators(KeyChainActions, props.dispatch)
        this.settingAction = bindActionCreators(SettingActions, props.dispatch)
        this.state = {
            password: '',
            passwordRepeat: ''
        }
    }

    async componentDidMount() {
        const scatter = await StorageHelper.getScatter()
        LocalizationHelper.setLan(scatter.setting.language)
        this.keyChainAction.initKV({
            keypairs: scatter.keyChain.keypairs,
            identitys: scatter.keyChain.identitys,
            permissions: scatter.keyChain.permissions
        })
        this.settingAction.initKV({
            locked: scatter.setting.locked,
            password: scatter.setting.password,
            networks: scatter.setting.networks,
            language: scatter.setting.language,
            created: scatter.setting.created
        })
        if (scatter.setting.password.length > 0) {
            const { history } = this.props
            history.replace('/main')
        }
    }

    /**
     * 创建钱包
     */
    createWallet() {
        const { password } = this.state
        const { history } = this.props
        Toast.loading(LocalizationHelper.valueForKey('create_wallet_ing'), 0)
        const hashed = EncryptHelper.md5(EncryptHelper.md5(password), RandomFactory.systemSalt())
        const networks = PluginFactory.signatureProviders().map(plugin => plugin.getEndorsedNetwork().clone())

        const scatter = new FOScatter()
        scatter.setting.password = hashed
        scatter.setting.networks = networks

        FOScatterInterface.saveScatter(scatter)
        this.settingAction.updateKV('password', hashed)
        this.settingAction.updateKV('networks', networks)
        Toast.hide()
        history.replace('/main')
    }

    /**
     * 检测创建钱包的参数
     */
    prepareCreateWallet() {
        const { password, passwordRepeat } = this.state
        if (password.length <= 0) {
            Toast.info(LocalizationHelper.valueForKey('password_empty'), kToastDurtion)
            return
        }
        if (passwordRepeat.length <= 0) {
            Toast.info(LocalizationHelper.valueForKey('repeat_password_empty'), kToastDurtion)
            return
        }
        if (password !== passwordRepeat) {
            Toast.info(LocalizationHelper.valueForKey('password_different'), kToastDurtion)
            return
        }
        if (password.length < kPasswordLen) {
            Toast.info(LocalizationHelper.valueForKey('password_shortest_len') + kPasswordLen, kToastDurtion)
            return
        }
        this.createWallet()
    }

    /**
     * 解锁钱包
     */
    unlockWallet() {
        const { password } = this.state
        if (password.length <= 0) {
            Toast.info(LocalizationHelper.valueForKey('password_empty'), kToastDurtion)
            return
        }
        if (password.length < kPasswordLen) {
            Toast.info(LocalizationHelper.valueForKey('password_shortest_len') + kPasswordLen, kToastDurtion)
            return
        }
        const unlocked = FOScatterInterface.unlockScatter(password)
        if (unlocked) {
            this.settingAction.updateKV('locked', false)
            const { history } = this.props
            history.replace('/main')
        } else {
            Toast.fail(LocalizationHelper.valueForKey('password_error'), kToastDurtion)
        }
    }

    renderCreate() {
        const { password, passwordRepeat } = this.state
        return (
            <div className='field'>
                <input
                    className='input'
                    type='password'
                    placeholder={LocalizationHelper.valueForKey('set_plugin_password')}
                    value={password}
                    onChange={e => this.setState({ password: e.target.value.trim() })}
                />
                <input
                    className='input repeat'
                    type='password'
                    placeholder={LocalizationHelper.valueForKey('repeat_plugin_password')}
                    value={passwordRepeat}
                    onChange={e => this.setState({ passwordRepeat: e.target.value.trim() })}
                />
                <div className='button' onClick={() => this.prepareCreateWallet()}>
                    {LocalizationHelper.valueForKey('create_wallet')}
                </div>
            </div>
        )
    }

    renderUnlock() {
        const { password } = this.state
        return (
            <div className='field'>
                <input
                    className='input'
                    type='password'
                    placeholder={LocalizationHelper.valueForKey('enter_plugin_password')}
                    value={password}
                    onChange={e => this.setState({ password: e.target.value.trim() })}
                />
                <div className='button' onClick={() => this.unlockWallet()}>
                    {LocalizationHelper.valueForKey('unlock_wallet')}
                </div>
            </div>
        )
    }

    render() {
        const { locked } = this.props
        return (
            <div className='entry'>
                <img className='logo'
                    src={require('../../assets/logo.png')}
                />
                {
                    locked
                        ? this.renderUnlock()
                        : this.renderCreate()
                }
            </div>
        )
    }
}

function mapStateToProps({ setting }: IStoreState) {
    return {
        locked: setting.locked,
        password: setting.password,
        language: setting.language
    }
}

export default connect(mapStateToProps)(Entry)
