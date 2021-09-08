import React, { Component } from 'react'
import LocalizationHelper from '../../localization/LocalizationHelper'

interface IPromptMasterProps {
    titleKey: string
}

export default class PromptMaster extends Component<IPromptMasterProps> {
    render() {
        const { children, titleKey } = this.props
        return (
            <div id='prompt_master'>
                <div className='title'>
                    {LocalizationHelper.valueForKey(titleKey)}
                </div>
                {children}
            </div>
        )
    }
}