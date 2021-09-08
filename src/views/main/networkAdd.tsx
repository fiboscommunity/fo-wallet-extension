import React, { Component } from 'react'
import { History } from 'history'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Father from '../component/father'
import LocalizationHelper from '../../localization/LocalizationHelper'
import { ProtocolEnum, stringToProtocolEnum } from '../../models/Enum'
import { IStoreState } from '../../reducer/index'
import Network from '../../models/Network'
import NetworkCustom from '../../models/NetworkCustom'
import Pop from '../component/pop'
import Toast from '../component/toast'
import { kToastDurtion } from '../../config'
import * as SettingActions from '../../actions/setting'
import FOScatterInterface from '../../interface/Interface'
import PluginFactory from '../../plugins/PluginFactory'


interface INetworkAddProps {
    history?: History
    dispatch?: Dispatch,
    networks: Array<Network>
}

interface INetworkAddState {
    chain: string
    prefix: string
    protocol: number
    host: string
    port: string
    chainId: string
}

class NetworkAdd extends Component<INetworkAddProps, INetworkAddState> {
    private pop: Pop
    private chains: Array<string>
    private protocols: Array<string>
    private settingActions: typeof SettingActions

    constructor(props: INetworkAddProps) {
        super(props)
        this.protocols = Object.keys(ProtocolEnum).filter(e => isNaN(parseInt(e, 10)))
        this.settingActions = bindActionCreators(SettingActions, props.dispatch)
        this.state = {
            chain: '',
            prefix: '',
            protocol: 1,
            host: '',
            port: '',
            chainId: ''
        }
    }

    save() {
        const { host, port, chainId, chain, protocol, prefix } = this.state
        if (host.trim().length <= 0)
            return Toast.info(LocalizationHelper.valueForKey('invalid_host_name'), kToastDurtion)
        if (chainId.trim().length <= 0)
            return Toast.info(LocalizationHelper.valueForKey('invalid_chain_id'), kToastDurtion)
        if (!(/^[0-9]+$/.test(port)))
            return Toast.info(LocalizationHelper.valueForKey('invalid_port'), kToastDurtion)
        const network_ = new NetworkCustom({
            name: `${chain.toUpperCase()} Net`,
            port: parseInt(port),
            protocol: stringToProtocolEnum(this.protocols[protocol]),
            chainId: chainId,
            blockchain: chain,
            host,
            prefix
        })
        const { networks, history } = this.props
        const exist = networks.find(network => network.unique2() === network_.unique2())
        if (exist)
            return Toast.info(LocalizationHelper.valueForKey('network_eists'), kToastDurtion)
        this.settingActions.addNetwork(network_)
        FOScatterInterface.addNetwork(network_)
        PluginFactory.hotPlugin([network_])
        Toast.success(LocalizationHelper.valueForKey('network_add_success'), kToastDurtion)
        history.goBack()
        return undefined
    }

    mouseEnter(evt: React.MouseEvent, type: string) {
        const target = evt.target as HTMLElement
        const isChild = evt.target !== evt.currentTarget
        let y: number = isChild ? target.parentElement.offsetTop : target.offsetTop
        const opts = type === 'chain' ? this.chains : this.protocols
        this.pop.show({
            r: 24,
            y: y + 44,
            w: window.innerWidth - 24 * 2,
            hash: type,
            options: opts,
        })
    }

    onSelect(idx: number, hash: string) {
        const { protocol } = this.state
        if (protocol === idx) {
            return
        }
        this.setState({ protocol: idx })
    }

    render() {
        const { history } = this.props
        const { host, port, prefix, chainId, chain, protocol } = this.state
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                right={require('../../assets/save.png')}
                rightHandle={() => this.save()}
                title={LocalizationHelper.valueForKey('add_chain')}
            >
                <div className='import'>
                    <span className='tag'>
                        {LocalizationHelper.valueForKey('add_network')}
                    </span>
                    <div className='detail'>
                        {LocalizationHelper.valueForKey('add_network_tip')}
                    </div>
                    <div className='account_item'>
                        <span className='account_name'>
                            {this.protocols[protocol]}
                        </span>
                        <span
                            className='account_arrow_mask'
                            onClick={evt => this.mouseEnter(evt, 'protocol')}
                        >
                            <img
                                className='account_arrow'
                                src={require('../../assets/arrow.png')}
                            />
                        </span>
                    </div>
                    <div className='account_item'>
                        <input
                            type='text'
                            value={chain}
                            placeholder={`${LocalizationHelper.valueForKey('chain_name')} fibos`}
                            className='text_input'
                            onChange={e => this.setState({ chain: e.target.value.trim().toLowerCase() })}
                        />
                    </div>
                    <div className='account_item'>
                        <input
                            type='text'
                            value={prefix}
                            placeholder={`${LocalizationHelper.valueForKey('chain_prefix')} FO`}
                            className='text_input'
                            onChange={e => this.setState({ prefix: e.target.value.trim().toUpperCase() })}
                        />
                    </div>
                    <div className='account_item'>
                        <input
                            type='text'
                            value={host}
                            className='text_input'
                            placeholder={`${LocalizationHelper.valueForKey('host')} to-rpc.fibos.io`}
                            onChange={e => this.setState({ host: e.target.value.trim() })}
                        />
                    </div>
                    <div className='account_item'>
                        <input
                            type='text'
                            value={port}
                            className='text_input'
                            placeholder={`${LocalizationHelper.valueForKey('port')} 443`}
                            onChange={e => this.setState({ port: e.target.value.trim() })}
                        />
                    </div>
                    <div className='account_item'>
                        <input
                            type='text'
                            value={chainId}
                            className='text_input'
                            placeholder={LocalizationHelper.valueForKey('chain_id')}
                            onChange={e => this.setState({ chainId: e.target.value.trim() })}
                        />
                    </div>
                </div>
                <Pop
                    ref={e => this.pop = e}
                    callback={(idx, hash) => this.onSelect(idx, hash)}
                />
            </Father>
        )
    }
}


function mapStateToProps({ setting }: IStoreState) {
    return {
        networks: setting.networks,
    }
}

export default connect(mapStateToProps)(NetworkAdd)
