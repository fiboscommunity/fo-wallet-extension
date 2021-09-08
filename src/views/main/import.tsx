import React, { Component } from 'react'
import Toast from '../component/toast/index'
import { History } from 'history'
import { connect } from 'react-redux'
import Father from '../component/father'
import LocalizationHelper from '../../localization/LocalizationHelper'
import Pop from '../component/pop'
import Network from '../../models/Network'
import { IStoreState } from '../../reducer/index'
import PluginFactory from '../../plugins/PluginFactory'
import { kToastDurtion } from '../../config'
import Keypair from '../../models/Keypair'
import RandomFactory from '../../utils/RandomFactory'
import EncryptHelper from '../../utils/EncryptHelper'

interface IImportProps {
    history?: History
    networks: Array<Network>
    keypairs: Array<Keypair>
}

interface IImportState {
    privatekey: string
    selected: number
}

class Import extends Component<IImportProps, IImportState> {
    private pop: Pop

    constructor(props: IImportProps) {
        super(props)

        this.state = {
            privatekey: '',
            selected: 0
        }
    }

    getOptions(): Array<string> {
        const { networks } = this.props
        return networks.map(network => network.name)
    }

    mouseEnter(evt: React.MouseEvent) {
        const target = evt.target as HTMLElement
        const isChild = evt.target !== evt.currentTarget
        let y: number = isChild ? target.parentElement.offsetTop : target.offsetTop
        this.pop.show({
            r: 24,
            y: y + 44,
            w: window.innerWidth - 24 * 2,
            options: this.getOptions()
        })
    }

    onSelect(idx: number) {
        const { selected } = this.state
        if (selected === idx) {
            return
        }
        this.setState({ selected: idx })
    }

    async queryAccount() {
        const { selected, privatekey } = this.state
        const { networks, history } = this.props
        const network = networks[selected]
        const plugin = await PluginFactory.plugin(network.blockchain)
        let isValid = plugin.validPrivateKey(privatekey)
        if (!isValid) {
            Toast.info(LocalizationHelper.valueForKey('invalid_privatekey'), kToastDurtion)
            return
        }
        const publicKey = plugin.privateToPublic(privatekey)

        Toast.loading(LocalizationHelper.valueForKey('query_account'), 0)
        const iv = RandomFactory.iv()
        let kp = new Keypair({
            blockChain: network.blockchain,
            name: RandomFactory.string(8, true),
            publicKey: publicKey,
            privateKey: EncryptHelper.aesEncrypt(iv, RandomFactory.systemSalt(), privatekey),
            iv
        })
        const accounts = await plugin.importAccount(kp, network)
        Toast.hide()
        if (accounts.length <= 0) {
            Toast.info(LocalizationHelper.valueForKey('no_account_found'), kToastDurtion)
            return
        }
        history.push('/selectaccount', {
            accounts, network, kp
        })
    }


    render() {
        const { privatekey, selected } = this.state
        const { history } = this.props
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                title={LocalizationHelper.valueForKey('import_account')}
            >
                <div className='import'>
                    <span className='tag'>
                        {LocalizationHelper.valueForKey('pick_chain')}
                    </span>
                    <div className='account_item'>
                        <span className='account_name'>
                            {this.getOptions()[selected]}
                        </span>
                        <span
                            className='account_arrow_mask'
                            onClick={evt => this.mouseEnter(evt)}
                        >
                            <img
                                className='account_arrow'
                                src={require('../../assets/arrow.png')}
                            />
                        </span>
                    </div>
                    <span className='tag'>
                        {LocalizationHelper.valueForKey('privatekey')}
                    </span>
                    <textarea
                        className='textarea scroll'
                        placeholder={LocalizationHelper.valueForKey('input_privatekey')}
                        maxLength={51}
                        value={privatekey}
                        onChange={e => this.setState({ privatekey: e.target.value.trim() })}
                    />
                    <div
                        className='continue'
                        onClick={() => this.queryAccount()}
                    >
                        {LocalizationHelper.valueForKey('continue')}
                    </div>
                </div>
                <Pop
                    ref={e => this.pop = e}
                    callback={idx => this.onSelect(idx)}
                />
            </Father>
        )
    }
}

function mapStateToProps({ setting, keychain }: IStoreState) {
    return {
        networks: setting.networks,
        keypairs: keychain.keypairs
    }
}

export default connect(mapStateToProps)(Import)