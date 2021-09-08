import React, { Component } from 'react'
import { connect } from 'react-redux'
import { match } from 'react-router-dom'
import Father from '../component/father'
import { History } from 'history'
import LocalizationHelper from '../../localization/LocalizationHelper'
import { IStoreState } from '../../reducer'
import Identity from '../../models/Identity'
import Keypair from '../../models/Keypair'
import EncryptHelper from '../../utils/EncryptHelper'
import RandomFactory from '../../utils/RandomFactory'
import UtilsHelper from '../../utils/UtilsHelper'

interface IShowPrivatekeyProps {
    match?: match
    history?: History
    identitys: Array<Identity>
    keypairs: Array<Keypair>
}

interface IHashProps {
    hash: string
}

class ShowPrivatekey extends Component<IShowPrivatekeyProps> {
    private privateKey: string
    constructor(props: IShowPrivatekeyProps) {
        super(props)
        const { match, identitys, keypairs } = props
        const { hash } = match.params as IHashProps
        const identity = identitys.find(identity => identity.hash === hash)
        const keypair = keypairs.find(keypair => keypair.publicKey === identity.publicKey)
        this.privateKey = EncryptHelper.aesDecrypt(keypair.iv, RandomFactory.systemSalt(), keypair.privateKey)
    }

    render() {
        const { history } = this.props
        return (
            <Father
                history={history}
                left={require('../../assets/back.png')}
                title={LocalizationHelper.valueForKey('export_privatekey')}
            >
                <div className='verify'>
                    <span className='tag'>
                        {LocalizationHelper.valueForKey('write_down_privatekey')}
                    </span>
                    <div className='privatekey'>
                        {this.privateKey}
                    </div>
                </div>
            </Father>
        )
    }
}


function mapStateToProps({ setting, keychain }: IStoreState) {
    return {
        identitys: keychain.identitys,
        keypairs: keychain.keypairs
    }
}

export default connect(mapStateToProps)(ShowPrivatekey)