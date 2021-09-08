import React, { Component } from 'react'
import { connect } from 'react-redux'
import Toast from '../component/toast/index'
import { match } from 'react-router-dom'
import { kPasswordLen, kToastDurtion } from '../../config'
import Father from '../component/father'
import { History } from 'history'
import LocalizationHelper from '../../localization/LocalizationHelper'
import { IStoreState } from '../../reducer'
import EncryptHelper from '../../utils/EncryptHelper'
import RandomFactory from '../../utils/RandomFactory'

interface IExportPrivateKeyProps {
    match?: match
    history?: History
    password: string
}

interface IExportPrivateKeyState {
    pwd: string
}

interface IHashProps {
    hash: string
}

class ExportPrivateKey extends Component<IExportPrivateKeyProps, IExportPrivateKeyState> {
    constructor(props: IExportPrivateKeyProps) {
        super(props)
        this.state = {
            pwd: ''
        }
    }

    /**
     * 校验密码是否正确
     * @param pwd 
     */
    checkPwd(pwd: string): boolean {
        const { password } = this.props
        if (pwd.length <= 0) {
            Toast.info(LocalizationHelper.valueForKey('password_empty'), kToastDurtion)
            return false
        }
        const hashed = EncryptHelper.md5(EncryptHelper.md5(pwd), RandomFactory.systemSalt())
        if (hashed !== password) {
            Toast.info(LocalizationHelper.valueForKey('password_error'), kToastDurtion)
            return false
        }
        return true
    }

    doneClick() {
        const { pwd } = this.state
        const pass = this.checkPwd(pwd)
        if (!pass) {
            return
        }
        const { history, match } = this.props
        const { hash } = match.params as IHashProps
        history.push(`/showpk/${hash}`)
    }

    render() {
        const { history } = this.props
        const { pwd } = this.state
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                title={LocalizationHelper.valueForKey('export_privatekey')}
            >
                <div className='verify'>
                    <span className='tag'>
                        {LocalizationHelper.valueForKey('verify_password')}
                    </span>
                    <input
                        className='input'
                        type='password'
                        placeholder={LocalizationHelper.valueForKey('enter_password')}
                        value={pwd}
                        onChange={e => this.setState({ pwd: e.target.value.trim() })}
                    />
                    <div className='btn' onClick={() => this.doneClick()}>
                        {LocalizationHelper.valueForKey('determine')}
                    </div>
                </div>
            </Father>
        )
    }
}

function mapStateToProps({ setting }: IStoreState) {
    return {
        password: setting.password
    }
}

export default connect(mapStateToProps)(ExportPrivateKey)
