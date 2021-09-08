import React, { Component } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { History } from 'history'
import Father from '../component/father'
import LocalizationHelper from '../../localization/LocalizationHelper'
import { IStoreState } from '../../reducer'
import Network from '../../models/Network'
import * as CreateActions from '../../actions/create'
import * as SettingActions from '../../actions/setting'
import PluginFactory from '../../plugins/PluginFactory'
import Toast from '../component/toast/index'
import { kToastDurtion } from '../../config'
import FOScatterInterface from '../../interface/Interface'
import Plugin from '../../plugins/Plugin'
import Keypair from '../../models/Keypair'
import RandomFactory from '../../utils/RandomFactory'
import EncryptHelper from '../../utils/EncryptHelper'

interface ICreateProps {
    history?: History
    networks: Array<Network>
    dispatch?: Dispatch
    name: string
    network: number
    privateKey: string
}

class BackUp extends Component<ICreateProps> {
    private createAction: typeof CreateActions
    private settingAction: typeof SettingActions

    constructor(props: ICreateProps) {
        super(props)
        this.createAction = bindActionCreators(CreateActions, props.dispatch)
        this.settingAction = bindActionCreators(SettingActions, props.dispatch)
    }

    async componentDidMount() {
        this.createAction.updateKV('privateKey', LocalizationHelper.valueForKey('generate_privatekey_ing'))
        const { network, networks } = this.props
        const network_ = networks[network]
        const plugin = PluginFactory.basePlugin()
        const privateKey = await plugin.randomPrivateKey()
        this.createAction.updateKV('privateKey', privateKey)
    }

    /**
     * 创建账户
     */
    async createDidClick() {
        const { network, networks, name, privateKey } = this.props
        if (privateKey.length <= 0) {
            Toast.info(LocalizationHelper.valueForKey('generate_privatekey'), kToastDurtion)
            return
        }
        Toast.loading(LocalizationHelper.valueForKey('create_account_ing'), 0)
        const network_ = networks[network]
        const plugin = await PluginFactory.plugin(network_.blockchain)
        const publicKey = plugin.privateToPublic(privateKey)
        plugin.createAccountBySystem(name, publicKey)
            .then(() => {
                Toast.success(LocalizationHelper.valueForKey('create_account_success'), kToastDurtion)
                FOScatterInterface.markHasCreated()
                this.settingAction.updateKV('created', true)
                this.checkAccounts(plugin, network_, publicKey, privateKey)
            })
            .catch(() => {
                Toast.hide()
                Toast.fail(LocalizationHelper.valueForKey('create_account_failed'), kToastDurtion)
            })
    }

    checkAccounts(plugin: Plugin, network: Network, publicKey: string, privateKey: string) {
        setTimeout(async () => {
            const iv = RandomFactory.iv()
            let kp = new Keypair({
                blockChain: network.blockchain,
                name: RandomFactory.string(8, true),
                publicKey: publicKey,
                privateKey: EncryptHelper.aesEncrypt(iv, RandomFactory.systemSalt(), privateKey),
                iv
            })
            const accounts = await plugin.importAccount(kp, network)
            if (accounts.length <= 0) {
                this.checkAccounts(plugin, network, publicKey, privateKey)
            } else {
                Toast.hide()
                const { history } = this.props
                this.createAction.clear()
                history.replace('/selectaccount', {
                    accounts, network, kp
                })
            }
        }, 2000)
    }

    render() {
        const { history, privateKey } = this.props
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                title={LocalizationHelper.valueForKey('create_accout')}
            >
                <div className='import'>
                    <span className='tag'>
                        {LocalizationHelper.valueForKey('backup_privatekey')}
                    </span>
                    <div className='textarea scroll pk'>
                        {privateKey}
                    </div>
                    <div
                        className='continue'
                        onClick={() => this.createDidClick()}
                    >
                        {LocalizationHelper.valueForKey('create')}
                    </div>
                </div>
            </Father>
        )
    }
}

function mapStateToProps({ setting, create }: IStoreState) {
    return {
        networks: setting.networks,
        network: create.network,
        name: create.name,
        privateKey: create.privateKey
    }
}


export default connect(mapStateToProps)(BackUp)
