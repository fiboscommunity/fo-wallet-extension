import React, { Component } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { format } from 'date-fns'
import { match } from 'react-router-dom'
import { History } from 'history'
import { connect } from 'react-redux'
import { IStoreState } from '../../reducer/index'
import Identity from '../../models/Identity'
import Permission from '../../models/Permission'
import * as KeyChainActions from '../../actions/keychain'
import LocalizationHelper from '../../localization/LocalizationHelper'
import Father from '../component/father'
import FOScatterInterface from '../../interface/Interface'
import Modal from '../component/modal/index'
import UtilsHelper from '../../utils/UtilsHelper'
import GroupHelper from '../../utils/GroupHelper'

interface IAccountManagerProps {
    identitys: Array<Identity>
    match?: match
    permissions: Array<Permission>
    history?: History
    dispatch?: Dispatch
}

interface IHashProps {
    hash: string
}

class AccountManager extends Component<IAccountManagerProps> {
    private keyChainAction: typeof KeyChainActions

    constructor(props: IAccountManagerProps) {
        super(props)
        this.keyChainAction = bindActionCreators(KeyChainActions, props.dispatch)
    }


    filterPermission(): { [key: string]: Array<Permission> } {
        const { match: { params }, permissions, identitys } = this.props
        const { hash } = params as IHashProps
        const identity = identitys.find(e => e.hash === hash)
        const next = permissions.filter(e => e.publicKey === identity.publicKey)
        next.sort((x, y) => {
            if (x.contract === null)
                return -1
            if (x.contract > y.contract)
                return 1
            if (x.contract < y.contract)
                return -1
            return 0
        })
        return GroupHelper.groupBy(next, 'domain')
    }

    /**
     * 移除白名单
     * @param permission 权限
     */
    revokeContract(permission: Permission) {
        Modal.alert(
            <span className='alert_title'>
                {LocalizationHelper.valueForKey('del_contract')}
            </span>,
            <span className='alert_message'>
                {LocalizationHelper.valueForKey('revoke_contract_really')}
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
                        this.keyChainAction.revokeContract(permission)
                        FOScatterInterface.revokeIdentity(permission)
                    }
                },
            ])
    }

    /**
     * 删除身份
     * @param permission 身份
     */
    revokeAuthor(permission: Permission) {
        Modal.alert(
            <span className='alert_title'>
                {LocalizationHelper.valueForKey('del_author')}
            </span>,
            <span className='alert_message'>
                {LocalizationHelper.valueForKey('revoke_auth_really')}
            </span>
            , [
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
                        this.keyChainAction.revokeAuthor(permission)
                        FOScatterInterface.delPermisssion(permission)
                    }
                },
            ])
    }

    /**
     * 渲染身份
     * @param permission 
     * @param idx 
     */
    renderIdentity(permission: Permission, idx: number) {
        return (
            <div
                className='w_item'
                key={idx.toString()}
            >
                <div className='w_preview'>
                    <span className='w_title'>
                        {permission.domain}
                    </span>
                    <span className='w_detail'>

                    </span>
                </div>
                <div className='w_operate'>
                    <span
                        className='btn'
                        onClick={() => this.revokeAuthor(permission)}
                    >
                        {LocalizationHelper.valueForKey('del_author')}
                    </span>
                    {/* <span className='time'>
                        {format(new Date(permission.timespan), 'yyyy.MM.dd HH:mm')}
                    </span> */}
                </div>
            </div>
        )
    }

    /**
     * 渲染权限
     * @param permission 
     * @param idx 
     */
    renderItem(permission: Permission, idx: number) {
        return (
            <div
                className='w_item w_perm'
                key={idx.toString()}
            >
                <div className='w_preview'>
                    <span className='w_title'>
                        {permission.contract}
                    </span>
                    <span className='w_detail'>
                        {permission.action}
                    </span>
                </div>
                <div className='w_operate'>
                    <span
                        className='btn_'
                        onClick={() => this.revokeContract(permission)}
                    >
                        {LocalizationHelper.valueForKey('del_contract')}
                    </span>
                    {/* <span className='time'>
                        {format(new Date(permission.timespan), 'yyyy.MM.dd HH:mm')}
                    </span> */}
                </div>
            </div>
        )
    }

    renderPermissions(datasource: { [key: string]: Array<Permission> }) {
        return (
            <div id='whitelist'>
                {
                    Object.keys(datasource).map(k => (
                        <div className='group' key={k}>
                            {
                                datasource[k].map((perm, i) => {
                                    return perm.contract === null && perm.action === null
                                        ? this.renderIdentity(perm, i)
                                        : this.renderItem(perm, i)
                                })
                            }
                        </div>
                    ))
                }
            </div>
        )
    }

    renderEmpty() {
        return (
            <div className='no_whitelist'>
                {LocalizationHelper.valueForKey('whitelist_empty')}
            </div>
        )
    }

    render() {
        const { history } = this.props
        const ds = this.filterPermission()
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                title={LocalizationHelper.valueForKey('whitelist')}
            >
                {
                    Object.keys(ds).length <= 0
                        ? this.renderEmpty()
                        : this.renderPermissions(ds)
                }
            </Father>
        )
    }
}

function mapStateToProps({ keychain }: IStoreState) {
    return {
        identitys: keychain.identitys,
        permissions: keychain.permissions
    }
}

export default connect(mapStateToProps)(AccountManager)
