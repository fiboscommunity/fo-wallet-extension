import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { History } from 'history'
import { IStoreState } from '../../reducer/index'
import Identity from '../../models/Identity'
import LocalizationHelper from '../../localization/LocalizationHelper'
import Pop2 from '../component/pop2'
import Pop2Setting from '../component/pop2'
import Network from '../../models/Network'
import * as KeyChainActions from '../../actions/keychain'
import FOScatterInterface from '../../interface/Interface'
import { kToastDurtion } from '../../config'
import Toast from '../component/toast/index'
import Modal from '../component/modal/index'

interface IMainProps {
    dispatch?: Dispatch
    history?: History
    identitys: Array<Identity>
    networks: Array<Network>
    created: boolean
}

interface IMainState {
}

class Main extends Component<IMainProps, IMainState> {
    private pop: Pop2
    private popSetting: Pop2Setting
    private keyChainAction: typeof KeyChainActions

    constructor(props: IMainProps) {
        super(props)
        this.keyChainAction = bindActionCreators(KeyChainActions, props.dispatch)
    }

    mouseEnter(evt: React.MouseEvent, hash: string) {
        const target = evt.target as HTMLElement
        const offsetY = target.parentElement.parentElement.scrollTop
        const isChild = evt.target !== evt.currentTarget
        let y: number = isChild ? target.parentElement.offsetTop : target.offsetTop
        this.pop.show({
            r: 18,
            y: y + 44 - offsetY,
            hash,
            options: [
                {
                    icon: require('../../assets/whitelist.png'),
                    title: LocalizationHelper.valueForKey('whitelist_manager')
                },
                {
                    icon: require('../../assets/export.png'),
                    title: LocalizationHelper.valueForKey('export_privatekey')
                },
                {
                    icon: require('../../assets/delete.png'),
                    title: LocalizationHelper.valueForKey('delete_account')
                },
            ]
        })
    }

    mouseEnterSetting(evt: React.MouseEvent) {
        const target = evt.target as HTMLElement
        const offsetY = target.parentElement.parentElement.scrollTop
        const isChild = evt.target !== evt.currentTarget
        let y: number = isChild ? target.parentElement.offsetTop : target.offsetTop
        this.popSetting.show({
            r: 10,
            y: y + 44 - offsetY,
            options: [
                {
                    title: LocalizationHelper.valueForKey('language')
                },
                {
                    title: LocalizationHelper.valueForKey('chain_manager')
                },
            ]
        })
    }

    onSelect(idx: number, hash?: string) {
        const { history } = this.props
        switch (idx) {
            case 0:
                history.push(`/accountmanager/${hash}`)
                break
            case 1:
                history.push(`/exportpk/${hash}`)
                break
            default:
                this.confirmDelete(hash)
                break
        }
    }

    onSettingSelect(idx: number) {
        const { history } = this.props
        switch (idx) {
            case 0:
                history.push(`/language`)
                break
                case 1:
                        history.push(`/chain`)
            default:
                break
        }
    }

    format(str: string, arg: string): string {
        return str.replace(new RegExp('\\{0\\}', 'g'), arg)
    }

    /**
     * 确认是否删除账户
     * @param hash hash
     */
    confirmDelete(hash?: string) {
        const { identitys } = this.props
        const identity = identitys.find(identity => identity.hash === hash)
        if (!identity) {
            return
        }
        Modal.alert(
            <span className='alert_title'>
                {LocalizationHelper.valueForKey('delete_identity')}
            </span>,
            <span className='alert_message'>
                {this.format(LocalizationHelper.valueForKey('unable_transaction_after_delete'), identity.name)}
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
                    onPress: () => this.deleteAccount(identity)
                },
            ])
    }

    /**
     * 删除账户
     * @param identity 
     */
    deleteAccount(identity: Identity) {
        FOScatterInterface.delIdentity(identity)
        this.keyChainAction.delIdentity(identity)
        Toast.success(LocalizationHelper.valueForKey('delete_account_success'), kToastDurtion)
    }

    renderNavBar() {
        return (
            <div className='navbar'>
                <span className='title main_title'>
                    {LocalizationHelper.valueForKey('account_list')}
                </span>
                <div className='menu_icon'>
                    <span className='right'>
                        <img
                            className='back_icon'
                            src={require('../../assets/setting.png')}
                            onClick={evt => this.mouseEnterSetting(evt)}
                        />
                    </span>
                    {/* <span className='right'>
                        <img className='back_icon' src={require('../../assets/chain.png')} />
                    </span> */}
                </div>
            </div>
        )
    }

    renderNoAccount() {
        const { created } = this.props
        return (
            <div className='content scroll'>
                <div className='no_account' style={!created ? undefined : { height: 'calc(100vh - 128px - 44px - 24px * 2 + 64px)'}} >
                    {LocalizationHelper.valueForKey('no_account')}
                </div>
            </div>
        )
    }

    renderAccounts() {
        const { identitys, networks, created } = this.props
        const dict: { [key: string]: string } = {}
        networks.forEach(network => dict[network.unique2()] = network.name)
        return (
            <div className='content scroll accounts' style={!created ? undefined : { height: 'calc(100vh - 196px + 64px)'}}>
                {
                    identitys.map(identity => (
                        <div className='account_item account_item2' key={identity.hash}>
                            <div className='preview'>
                                <span className='account_name'>
                                    {identity.name}
                                </span>
                                <span className='account_name'>
                                    {dict[Object.keys(identity.accounts)[0]]}
                                </span>
                            </div>
                            <span
                                className='account_setting_mask'
                                onClick={evt => this.mouseEnter(evt, identity.hash)}
                            >
                                <img
                                    className='account_setting'
                                    src={require('../../assets/account_setting.png')}
                                />
                            </span>
                        </div>
                    ))
                }
            </div>
        )
    }

    renderFooter() {
        const { history, created } = this.props
        return (
            <div className='footer'>
                {
                    created
                        ? null
                        : (
                            <div
                                className='create'
                                onClick={() => history.push('/create')}
                            >
                                {LocalizationHelper.valueForKey('create_accout')}
                            </div>
                        )
                }
                <div
                    className='import'
                    onClick={() => history.push('/import')}
                >
                    {LocalizationHelper.valueForKey('import_account')}
                </div>
            </div>
        )
    }

    render() {
        const { identitys } = this.props
        return (
            <div className='main'>
                {this.renderNavBar()}
                {
                    identitys.length > 0
                        ? this.renderAccounts()
                        : this.renderNoAccount()
                }
                {this.renderFooter()}
                <Pop2
                    ref={e => this.pop = e}
                    callback={(idx, hash) => this.onSelect(idx, hash)}
                />
                <Pop2Setting
                    ref={e => this.popSetting = e}
                    callback={(idx) => this.onSettingSelect(idx)}
                />
            </div>
        )
    }
}

function mapStateToProps({ keychain, setting }: IStoreState) {
    return {
        identitys: keychain.identitys,
        networks: setting.networks,
        created: setting.created
    }
}

export default connect(mapStateToProps)(Main)