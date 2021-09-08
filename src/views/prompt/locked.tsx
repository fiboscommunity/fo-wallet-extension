import React, { Component } from 'react'
import PromptMaster from './master'
import LocalizationHelper from '../../localization/LocalizationHelper'
import Prompt from '../../models/Prompt'

interface IPromptLockedProps {
    prompt: Prompt
}

export default class PromptLocked extends Component<IPromptLockedProps> {
    reject() {
        const { prompt: { responder } } = this.props
        responder(null)
        window.close()
    }

    render() {
        return (
            <PromptMaster titleKey='plugin_locked'>
                <div className='no_account'>
                    <span className='no_accout_title'>
                        {LocalizationHelper.valueForKey('plugin_locked')}
                    </span>
                    <span className='no_account_desc'>
                        {LocalizationHelper.valueForKey('unlock_step1')}
                    </span>
                    <span className='no_account_desc acount_locked_desc'>
                        {LocalizationHelper.valueForKey('unlock_step2')}
                    </span>
                    <span className='btn cancel_btn' onClick={() => this.reject()}>
                        {LocalizationHelper.valueForKey('cancel')}
                    </span>
                </div>
            </PromptMaster>
        )
    }
}