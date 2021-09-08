import React, { Component } from 'react'
import Prompt from '../../models/Prompt'
import FOScatter from '../../models/FOScatter'
import PromptMaster from './master'
import LocalizationHelper from '../../localization/LocalizationHelper'
import Pop from '../component/pop'
import { ProtocolEnum } from '../../models/Enum'
import Identity from '../../models/Identity'
import { IdentityFields } from '../../models/IdentityFields'

interface IIdentityProps {
    prompt: Prompt
    scatter: FOScatter
}

interface IIdentityState {
    selected: number
}

export default class IdentityPrompt extends Component<IIdentityProps, IIdentityState> {
    private pop: Pop
    private opts: Array<string> = []
    private identitys: Array<Identity> = []

    constructor(props: IIdentityProps) {
        super(props)
        const { scatter: { keyChain: { identitys } }, prompt: { data } } = props
        this.identitys = identitys.filter(identity => {
            if (identity.hasRequiredFields(data)) {
                this.opts.push(identity.name)
                return true
            }
            return false
        })
        this.state = {
            selected: 0
        }
    }


    mouseEnter(evt: React.MouseEvent) {
        const target = evt.target as HTMLElement
        const isChild = evt.target !== evt.currentTarget
        let y: number = isChild ? target.parentElement.offsetTop : target.offsetTop
        this.pop.show({
            y: y + 44,
            x: 28,
            w: isChild ? target.parentElement.parentElement.clientWidth : target.parentElement.clientWidth,
            options: this.opts
        })
    }

    onSelect(idx: number) {
        const { selected } = this.state
        if (selected === idx) {
            return
        }
        this.setState({ selected: idx })
    }

    reject() {
        const { prompt: { responder } } = this.props
        responder(null)
        window.close()
    }

    accept() {
        const { prompt: { responder } } = this.props
        const { selected } = this.state
        responder(this.identitys[selected])
        window.close()
    }


    renderNoAccount() {
        return (
            <div className='no_account'>
                <span className='no_accout_title'>
                    {LocalizationHelper.valueForKey('account_not_found')}
                </span>
                <span className='no_account_desc'>
                    {LocalizationHelper.valueForKey('import_create_account')}
                </span>
                <span className='btn cancel_btn' onClick={() => this.reject()}>
                    {LocalizationHelper.valueForKey('cancel')}
                </span>
            </div>
        )
    }

    renderAccounts() {
        const { prompt } = this.props
        const { network } = prompt
        const { selected } = this.state
        const host = `${ProtocolEnum[network.protocol]}://${network.host}:${network.port}`
        return (
            <div className='accounts'>
                <div className='header'>
                    <div className='account_item'>
                        <span className='account_name'>
                            {this.opts[selected]}
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
                    <div className='operate'>
                        <span className='btn accept' onClick={() => this.reject()}>
                            {LocalizationHelper.valueForKey('reject')}
                        </span>
                        <span className='btn accept' onClick={() => this.accept()}>
                            {LocalizationHelper.valueForKey('accept')}
                        </span>
                    </div>
                </div>
                <div className='account_title'>
                    {`${host} ${LocalizationHelper.valueForKey('request_select_identity')}`}
                </div>
                <div className='account_desc'>
                    {LocalizationHelper.valueForKey('confirm_trust')}
                </div>
            </div>
        )
    }

    render() {
        return (
            <PromptMaster titleKey='select_account'>
                {
                    this.identitys.length <= 0
                        ? this.renderNoAccount()
                        : this.renderAccounts()
                }
                <Pop
                    ref={e => this.pop = e}
                    callback={idx => this.onSelect(idx)}
                />
            </PromptMaster>
        )
    }
}