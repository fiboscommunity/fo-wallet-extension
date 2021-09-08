import React, { Component } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { History } from 'history'
import Father from '../component/father'
import LocalizationHelper from '../../localization/LocalizationHelper'
import Pop from '../component/pop'
import Network from '../../models/Network'
import { IStoreState } from '../../reducer'
import * as CreateActions from '../../actions/create'
import { kAccountNameRegex, kToastDurtion } from '../../config/index'
import Toast from '../component/toast/index'
import PluginFactory from '../../plugins/PluginFactory'

interface ICreateProps {
    history?: History
    networks: Array<Network>
    dispatch?: Dispatch
    name: string
    network: number
}


class Create extends Component<ICreateProps> {
    private pop: Pop
    private createAction: typeof CreateActions

    constructor(props: ICreateProps) {
        super(props)
        this.createAction = bindActionCreators(CreateActions, props.dispatch)
    }

    componentDidMount() {
        this.createAction.clear()
    }

    getOptions(): Array<string> {
        const { networks } = this.props
        return networks.map(network => network.name)
    }

    async createDidClick() {
        const { name, history, network, networks } = this.props
        if (!kAccountNameRegex.test(name)) {
            Toast.info(LocalizationHelper.valueForKey('account_name_not_match'), kToastDurtion)
            return
        }
        Toast.loading(LocalizationHelper.valueForKey('check_name_ing'), 0)
        const network_ = networks[network]
        const plugin = PluginFactory.basePlugin()
        const exist = await plugin.checkAccountExist(name, network_)
        Toast.hide()
        if (exist) {
            Toast.info(LocalizationHelper.valueForKey('name_exist'), kToastDurtion)
            return
        }
        history.push('/backup')
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
        const { network } = this.props
        if (network === idx) {
            return
        }
        this.createAction.updateKV('network', idx)
    }

    render() {
        const { history, name, network } = this.props
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                title={LocalizationHelper.valueForKey('create_accout')}
            >
                <div className='verify'>
                    <span className='tag'>
                        {LocalizationHelper.valueForKey('pick_chain')}
                    </span>
                    <div className='account_item'>
                        <span className='account_name'>
                            {this.getOptions()[network]}
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
                        {LocalizationHelper.valueForKey('enter_your_name')}
                    </span>
                    <input
                        className='textarea scroll input'
                        placeholder={LocalizationHelper.valueForKey('name_holder')}
                        maxLength={12}
                        value={name}
                        onChange={e => this.createAction.updateKV('name', e.target.value.trim())}
                    />
                    <div
                        className='btn'
                        onClick={() => this.createDidClick()}
                    >
                        {LocalizationHelper.valueForKey('create')}
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

function mapStateToProps({ setting, create }: IStoreState) {
    return {
        networks: setting.networks,
        network: create.network,
        name: create.name
    }
}

export default connect(mapStateToProps)(Create)
