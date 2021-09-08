import React, { Component } from 'react'
import { connect } from 'react-redux'
import { IStoreState } from '../../reducer/index'
import { IKeyChainState } from '../../reducer/keychain'
import { ISettingState } from '../../reducer/setting'

export default class NotFound extends Component {
    render() {
        return (
            <div>
                404
            </div>
        )
    }
}
