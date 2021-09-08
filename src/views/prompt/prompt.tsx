import React, { Component } from 'react'
import Prompt from '../../models/Prompt'
import { FO_IS_UNLOCK, FO_REQUEST_IDENTITY, FO_REQUEST_SIGN, REQUEST_ATTRIBUTE_SIGN } from '../../constKeys/ConstKeys'
import PromptLocked from './locked'
import Identity from './identity'
import Signature from './signature'
import AttributeSign from './attributeSign'
import '../../style/prompt'
import LocalizationHelper from '../../localization/LocalizationHelper'


interface IPromptMainProps {
    prompt: Prompt
}


export default class PromptMain extends Component<IPromptMainProps> {
    constructor(props: IPromptMainProps) {
        super(props)
        const { prompt: { scatter: { setting: { language } } } } = props
        LocalizationHelper.setLan(language)
    }

    render() {
        const { prompt } = this.props
        const { scatter } = prompt
        switch (prompt.type) {
            case FO_IS_UNLOCK:
                return <PromptLocked prompt={prompt} />
            case FO_REQUEST_IDENTITY:
                return <Identity prompt={prompt} scatter={scatter} />
            case FO_REQUEST_SIGN:
                return <Signature prompt={prompt} scatter={scatter} />
            case REQUEST_ATTRIBUTE_SIGN:
                return <AttributeSign prompt={prompt} scatter={scatter} />
            default:
                return <div />
        }
    }
}