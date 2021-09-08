import React, { Component } from 'react'
import Prompt from '../../models/Prompt'
import FOScatter from '../../models/FOScatter'
import PromptMaster from './master'
import LocalizationHelper from '../../localization/LocalizationHelper'
import { ISignProviderParams } from '../../plugins/PluginModel'

interface ISignatureProps {
    prompt: Prompt
    scatter: FOScatter
}

interface ISignatureState {
    selected: boolean
    isDetail: boolean
}


export default class Signature extends Component<ISignatureProps, ISignatureState> {
    constructor(props: ISignatureProps) {
        super(props)
        this.state = {
            selected: false,
            isDetail: true
        }
    }

    accept() {
        const { prompt: { responder } } = this.props
        const { selected } = this.state
        responder({
            type: 'confirm',
            white: selected
        })
        window.close()
    }

    reject() {
        const { prompt: { responder } } = this.props
        responder({
            type: 'cancel',
            white: false
        })
        window.close()
    }

    checkBoxSelected() {
        const { selected } = this.state
        this.setState({ selected: !selected })
    }

    renderHeader() {
        const { prompt } = this.props
        let data = prompt.data as ISignProviderParams
        const account = data.message[0].authorization
        const operate = `${LocalizationHelper.valueForKey('operate_account')}: ${account[0].actor}@${account[0].permission}`
        return (
            <div className='sign_header'>
                <div className='sign_header_top'>
                    <span>
                        {LocalizationHelper.valueForKey('contract_request')}
                    </span>
                    <div className='scroll actions'>
                        {
                            data.message.map((act, idx) => (
                                <span className='preview' key={idx.toString()}>
                                    {act.code}
                                    <img
                                        className='arrow'
                                        src={require('../../assets/arrow_right.png')}
                                    />
                                    {act.type}
                                </span>
                            ))
                        }
                    </div>
                </div>
                <div className='sign_header_bottom'>
                    <span>
                        {`${LocalizationHelper.valueForKey('net_address')}: ${prompt.domain}`}
                    </span>
                    <span>
                        {operate}
                    </span>
                </div>
            </div>
        )
    }

    renderSingleGroup(key: string, value: string) {
        return (
            <div className='signature_row' key={`${key}${value}`}>
                <span className='signature_key'>{`${key}:`}</span>
                <span className='signature_value'>{value}</span>
            </div>
        )
    }

    renderGroups(data: any, key: string) {
        if (Object.prototype.toString.call(data) !== '[object Object]') {
            return (
                <div className='signature_row' key={`lvl${data}`}>
                    <span className='signature_key signature_next'>{data}</span>
                </div>
            )
        }
        return (
            <div className='signature_group' key={key}>
                {
                    Object.keys(data).map(k => {
                        const v = data[k]
                        const toString = Object.prototype.toString.call(v)
                        if (toString === '[object Function]')
                            return null
                        if (toString === '[object Array]')
                            return v.map((e: any, i: number) => this.renderGroups(e, i.toString()))
                        if (toString === '[object Object]')
                            return (
                                <div className='signature_row signature_return' key={`lvl${k}`}>
                                    <span className='group_key'>{`${k}:`}</span>
                                    <div className='signature_next'>
                                        {this.renderGroups(v, `lvl${key}`)}
                                    </div>
                                </div>
                            )
                        return this.renderSingleGroup(k, v)
                    })
                }
            </div>
        )
    }

    renderDetail() {
        const { prompt: { data } } = this.props
        const message = data.message as Array<{ [key: string]: any }>
        return (
            <div className='signature_content'>
                {message.map((msg, idx) => this.renderGroups(msg.data, idx.toString()))}
            </div>
        )
    }

    renderJSON() {
        const { prompt: { data: { message } } } = this.props
        const str = JSON.stringify(message, null, 8)
            .replace(/ /gi, '&nbsp;')
            .replace(/\n/gi, '<br />')
        return (
            <div className='signature_content' dangerouslySetInnerHTML={{ __html: str }} />
        )
    }

    renderBody() {
        const { isDetail } = this.state
        return (
            <div className='signature_body'>
                <div className='tab'>
                    <span
                        className={isDetail ? 'tag_select' : 'tag_base'}
                        onClick={() => this.setState({ isDetail: true })}
                    >
                        {LocalizationHelper.valueForKey('details')}
                    </span>
                    <span
                        className={isDetail ? 'tag_base' : 'tag_select'}
                        onClick={() => this.setState({ isDetail: false })}
                    >
                        {LocalizationHelper.valueForKey('json')}
                    </span>
                    <div className='line' style={{ left: isDetail ? 0 : 80 }} />
                </div>
                <div className='content scroll'>
                    {
                        isDetail
                            ? this.renderDetail()
                            : this.renderJSON()
                    }
                </div>
            </div>
        )
    }

    renderFooter() {
        const { selected } = this.state
        return (
            <div className='signature_footer'>
                <div className='checkbox' onClick={() => this.checkBoxSelected()}>
                    <img
                        className='check_box'
                        src={selected
                            ? require('../../assets/checked.png')
                            : require('../../assets/tocheck.png')}
                    />
                    <span className='tips'>
                        {LocalizationHelper.valueForKey('append_to_whitelist')}
                    </span>
                </div>
                <span
                    className='btn'
                    onClick={() => this.reject()}
                >
                    {LocalizationHelper.valueForKey('reject')}
                </span>
                <span
                    className='btn accept'
                    onClick={() => this.accept()}
                >
                    {LocalizationHelper.valueForKey('accept')}
                </span>
            </div>
        )
    }

    render() {
        return (
            <PromptMaster titleKey='transaction_signature'>
                {this.renderHeader()}
                {this.renderBody()}
                {this.renderFooter()}
            </PromptMaster>
        )
    }
}