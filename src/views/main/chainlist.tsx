import React, { Component } from 'react'
import { History } from 'history'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Father from '../component/father'
import LocalizationHelper from '../../localization/LocalizationHelper'
import { IStoreState } from '../../reducer/index'
import Network from '../../models/Network'
import { ProtocolEnum } from '../../models/Enum'
import PluginFactory from '../../plugins/PluginFactory'
import Modal from '../component/modal'
import * as SettingActions from '../../actions/setting'
import FOScatterInterface from '../../interface/Interface'
import Toast from '../component/toast'
import { kToastDurtion } from '../../config'
import NetworkCustom from '../../models/NetworkCustom'

interface IChainListProps {
    history?: History
    dispatch?: Dispatch,
    networks: Array<Network>
}

class ChainList extends Component<IChainListProps> {
    private pluginCount: number
    private settingAction: typeof SettingActions

    constructor(props: IChainListProps) {
        super(props)
        this.pluginCount = PluginFactory.signatureProviders().length
        this.settingAction = bindActionCreators(SettingActions, props.dispatch)
    }

    removeNetwork(network: Network) {
        Modal.alert(
            <span className='alert_title'>
                {LocalizationHelper.valueForKey('del_network')}
            </span>,
            <span className='alert_message'>
                {`${LocalizationHelper.valueForKey('del_network_really')} ${network.name} ?`}
            </span>, [
                {
                    text: LocalizationHelper.valueForKey('cancel'),
                    style: {
                        color: '#333333',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }
                },
                {
                    text: LocalizationHelper.valueForKey('delete'),
                    style: {
                        color: 'red',
                        fontSize: '14px',
                        cursor: 'pointer'
                    },
                    onPress: () => {
                        this.settingAction.delNetwork(network)
                        FOScatterInterface.delNetwork(network)
                        Toast.success(LocalizationHelper.valueForKey('deleted_network'), kToastDurtion)
                    }
                },
            ])
    }

    renderItems() {
        const { networks } = this.props
        return networks.map((network: NetworkCustom, idx) => (
            <div className='chain_row' key={network.unique()}>
                <div className='chain_header'>
                    <span className='chain_net_name'>
                        {network.name}
                    </span>
                    {
                        !network.prefix
                            ? null
                            : (
                                <span
                                    className='chain_remove'
                                    onClick={() => this.removeNetwork(network)}
                                >
                                    {LocalizationHelper.valueForKey('delete')}
                                </span>
                            )
                    }
                </div>
                <span className='chain_name'>
                    {network.host}
                </span>
                <div className='chain_detail'>
                    <span className='chain_item'>
                        <img className='icon' src={require('../../assets/chain_name.png')} />
                        {network.blockchain.toUpperCase()}
                    </span>
                    <span className='chain_item'>
                        <img className='icon' src={require('../../assets/protocol.png')} />
                        {ProtocolEnum[network.protocol]}
                    </span>
                    <span className='chain_item'>
                        <img className='icon' src={require('../../assets/port.png')} />
                        {network.port}
                    </span>
                </div>
                <div className='chain_id_title'>
                    <img className='icon' src={require('../../assets/chain_name.png')} />
                    {LocalizationHelper.valueForKey('chain_id')}
                </div>
                <div className='chain_id'>
                    {network.chainId}
                </div>
            </div>
        ))
    }

    render() {
        const { history } = this.props
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                right={require('../../assets/add.png')}
                rightHandle={() => history.push('/add')}
                contentColor='#F5F5F5'
                title={LocalizationHelper.valueForKey('chain_manager')}
            >
                {this.renderItems()}
            </Father>
        )
    }
}

function mapStateToProps({ setting }: IStoreState) {
    return {
        networks: setting.networks,
    }
}

export default connect(mapStateToProps)(ChainList)