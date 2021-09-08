import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { match } from 'react-router-dom'
import Father from '../component/father'
import { History } from 'history'
import LocalizationHelper from '../../localization/LocalizationHelper'
import { IStoreState } from '../../reducer'
import * as SettingActions from '../../actions/setting'
import { LanguageEnum } from '../../models/Enum'
import FOScatterInterface from '../../interface/Interface'

interface ILanguageProps {
    match?: match
    history?: History
    dispatch?: Dispatch,
    language: LanguageEnum
}

class Language extends Component<ILanguageProps> {
    private settingAction: typeof SettingActions

    constructor(props: ILanguageProps) {
        super(props);
        this.settingAction = bindActionCreators(SettingActions, props.dispatch)
    }

    changeLanguage = (lan: string) => {
        switch (lan){
            case LanguageEnum[LanguageEnum.chinese]: 
                LocalizationHelper.setLan(LanguageEnum.chinese);
                this.settingAction.updateKV('language', LanguageEnum.chinese)
                FOScatterInterface.updateLanguage(LanguageEnum.chinese)
                break;
            case LanguageEnum[LanguageEnum.english]: 
                LocalizationHelper.setLan(LanguageEnum.english);
                this.settingAction.updateKV('language', LanguageEnum.english)
                FOScatterInterface.updateLanguage(LanguageEnum.english)
                break;
            default: break;
        }
    }

    titleCase = (str: string) => {
        let arr = str.split(" ");
        for( let i = 0; i < arr.length; i++ ) {
            arr[i] = arr[i].slice(0,1).toUpperCase() + arr[i].slice(1).toLowerCase();
        }
        return arr.join(" ");
    }

    render() {
        const { history, language } = this.props
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                title={LocalizationHelper.valueForKey('language')}
            >
                <div className='language'>
                {
                    Object.keys(LanguageEnum).map((item, index) => {
                        let button = null
                        if(isNaN(parseInt(item))){
                            if(item !== LanguageEnum[language]){
                                button =
                                (
                                    <div className='btn languageBtn' key={item} onClick={() => {
                                        this.changeLanguage(item)
                                    }}>
                                        {LocalizationHelper.valueForKey(item)}
                                    </div>
                                )
                            } else {
                                button =
                                (
                                    <div className='btn languageBtn noClick' key={item}>
                                        {LocalizationHelper.valueForKey(item)}
                                    </div>
                                )
                            }
                        }
                        return button
                    })
                }
                </div>
            </Father>
        )
    }
}

function mapStateToProps({ setting }: IStoreState) {
    return {
        language: setting.language
    }
}

export default connect(mapStateToProps)(Language)
