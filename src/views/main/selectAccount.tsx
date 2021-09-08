import React, { Component } from 'react'
import { History, Location } from 'history'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Toast from '../component/toast/index'
import Account from '../../models/Account'
import Father from '../component/father'
import LocalizationHelper from '../../localization/LocalizationHelper'
import Network from '../../models/Network'
import PluginFactory from '../../plugins/PluginFactory'
import FOScatterInterface from '../../interface/Interface'
import Keypair from '../../models/Keypair'
import Identity from '../../models/Identity'
import * as KeyChainActions from '../../actions/keychain'
import * as SettingActions from '../../actions/setting'
import { kToastDurtion } from '../../config'
import { IStoreState } from '../../reducer/index'


interface ISelectAccountProps {
    location?: Location
    history?: History
    dispatch?: Dispatch
    identitys: Array<Identity>
}

interface ISelectAccountState {
    selected: number
}

class SelectAccount extends Component<ISelectAccountProps, ISelectAccountState> {
    private keyChainAction: typeof KeyChainActions
    private settingAction: typeof SettingActions

    constructor(props: ISelectAccountProps) {
        super(props)
        this.keyChainAction = bindActionCreators(KeyChainActions, props.dispatch)
        this.settingAction = bindActionCreators(SettingActions, props.dispatch)
        this.state = {
            selected: 0
        }
    }

    componentDidMount() {
        const { location: { state } } = this.props
        const accounts: Array<Account> = state.accounts
        const nextAccount = accounts.filter(account => account.authority === 'active')
        if (nextAccount.length === 1) {
            this.select(nextAccount[0])
        }
    }

    identityExist(identity: Identity) {
        const { identitys } = this.props
        return identitys.find(id => id.hashStr() === identity.hashStr())
    }

    doneClick() {
        const { selected } = this.state
        const { location: { state } } = this.props
        let accounts: Array<Account> = state.accounts
        accounts = accounts.filter(account => account.authority === 'active')
        this.select(accounts[selected])
    }

    select(account: Account) {
        const { location: { state }, history } = this.props
        const network: Network = state.network
        const kp: Keypair = state.kp
        const plugin = PluginFactory.basePlugin()
        const identity = new Identity(kp.publicKey, plugin.formatter(account), {
            [network.unique2()]: new Account(kp.unique(), kp.publicKey, account.name, account.authority)
        })
        if (this.identityExist(identity)) {
            Toast.info(LocalizationHelper.valueForKey('account_exist'), kToastDurtion)
            return
        }
        Toast.loading(LocalizationHelper.valueForKey('import_account_ing'), 0)

        FOScatterInterface.addKeypair(kp)
        FOScatterInterface.addIdentity(identity)
        this.keyChainAction.addKeypair(kp)
        FOScatterInterface.markHasCreated()
        this.keyChainAction.addIdentity(identity)
        this.settingAction.updateKV('created', true)
        Toast.hide()
        Toast.success(LocalizationHelper.valueForKey('import_account_success'), kToastDurtion)
        history.go(-2)
    }

    renderAccounts() {
        const { location: { state } } = this.props
        let accounts: Array<Account> = state.accounts as Array<Account>
        accounts = accounts.filter(account => account.authority === 'active')
        const network: Network = state.network

        const { selected } = this.state
        const plugin = PluginFactory.basePlugin()
        return (
            <div className='select_account'>
                {
                    accounts.map((account, idx) => {
                        const display = plugin.formatter(account)
                        return (
                            <div
                                className='item'
                                key={display}
                                onClick={() => {
                                    const { selected } = this.state
                                    if (selected !== idx) {
                                        this.setState({ selected: idx })
                                    }
                                }}
                            >
                                <img
                                    className='icon'
                                    src={
                                        selected === idx
                                            ? require('../../assets/radio_select.png')
                                            : require('../../assets/radio_unselect.png')
                                    }
                                />
                                <span className='text'>
                                    {display}
                                </span>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    render() {
        const { history } = this.props
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                title={LocalizationHelper.valueForKey('import_account')}
            >
                <div className='import'>
                    <span className='tag'>
                        {LocalizationHelper.valueForKey('select_import_account')}
                    </span>

                    {this.renderAccounts()}

                    <div
                        className='done'
                        onClick={() => this.doneClick()}
                    >
                        {LocalizationHelper.valueForKey('done')}
                    </div>
                </div>

            </Father>
        )
    }
}

function mapStateToProps({ keychain }: IStoreState) {
    return {
        identitys: keychain.identitys
    }
}

export default connect(mapStateToProps)(SelectAccount)
