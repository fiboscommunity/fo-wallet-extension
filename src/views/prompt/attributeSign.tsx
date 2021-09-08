import React, { Component } from 'react'
import Prompt from '../../models/Prompt'
import FOScatter from '../../models/FOScatter'
import PromptMaster from './master'
import LocalizationHelper from '../../localization/LocalizationHelper'
import { ISignProviderParams } from '../../plugins/PluginModel'

interface IAttributeSignProps {
    prompt: Prompt
    scatter: FOScatter
}

interface ISignatureState {
    index: number
}


export default class AttributeSign extends Component<IAttributeSignProps, ISignatureState> {
    constructor(props: IAttributeSignProps) {
        super(props)
        this.state = {
            index: 0
        }
    }

    accept() {
        const { prompt: { responder } } = this.props
        const { index } = this.state
        responder({
            accept: true,
            index
        })
        window.close()
    }

    reject() {
        const { prompt: { responder } } = this.props
        responder({
            accept: false
        })
        window.close()
    }

    renderContent() {
        const { prompt: { scatter, data: { data, publicKey } } } = this.props
        const { index } = this.state
        const accounts = scatter.keyChain.findAccountsWithPublicKey(publicKey)
        return (
            <div className='attribute'>
                <div className='scroll attribute_data'>
                    {data}
                </div>
                <div className='scroll attribute_accounts'>
                    {
                        accounts.map((acc, idx) => (
                            <div
                                key={`${acc.name}@${acc.authority}`}
                                className={index === idx ? 'attribute_item_selected' : 'attribute_item'}
                            >
                                {acc.name}
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    }

    renderFooter() {
        return (
            <div className='signature_footer'>
                <div className='checkbox' />
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
        const { prompt } = this.props
        return (
            <PromptMaster titleKey='data_sign'>
                {this.renderContent()}
                {this.renderFooter()}
            </PromptMaster>
        )
    }
}