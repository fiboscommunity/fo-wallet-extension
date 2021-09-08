import FOScatter from '../models/FOScatter'
import Identity, { IdentitySub } from '../models/Identity'
import Permission from '../models/Permission'
import NotificationHelper from './NotificationHelper'
import Prompt from '../models/Prompt'
import * as ConstKeys from '../constKeys/ConstKeys'
import Network from '../models/Network'
import { kDefaultExp } from '../config'
import Signature from '../models/Signature'
import SignaturePayload from '../models/SignaturePayload'
import RandomFactory from './RandomFactory'
import UtilsHelper from './UtilsHelper'


export interface IGetOrRequestIdentity {
    domain: string
    network: Network
    fields: { [key: string]: any }
    scatter: FOScatter
    callback: (identity: Identity, fromPermission: boolean) => void
}

export default class IdentityHelper {

    static identityPermission(domain: string, scatter: FOScatter): Permission {
        return scatter.keyChain.permissions.find(perm => perm.isDomainIdentity(domain))
    }

    static identityFromPermissionsOrNull(domain: string, scatter: FOScatter) {
        const identityFromPermission = this.identityPermission(domain, scatter)
        return identityFromPermission ? identityFromPermission.getIdentity(scatter.keyChain, identityFromPermission.hex) : null
    }

    /**
     * token 签名
     * @param params 
     * @param identity 
     */
    private static createSign(params: IGetOrRequestIdentity, identity: Identity): Identity {
        const hex = UtilsHelper.signatureHex(identity.publicKey, params.domain)
        let signature = params.scatter.keyChain.signatures.find(s => s.hex === hex)
        const fromLocal = signature ? true : false
        let exp: number = kDefaultExp
        const now = +new Date()
        if (params.fields.hasOwnProperty('exp')) {
            let exp_ = params.fields.exp
            if (Object.prototype.toString.call(exp_) !== '[object Number]')
                exp = Number.parseInt(exp_, 0)
            else
                exp = exp_
        }
        if (signature) {
            signature.payload.exp = now + exp
        } else {
            const uuid: string = RandomFactory.uuid()
            const pubKey: string = identity.publicKey.substr(identity.publicKey.length - 50, 50)
            const payload = new SignaturePayload(pubKey, 'auth', params.domain, now, exp + now, uuid)
            signature = new Signature(hex, payload)
        }
        const kp = params.scatter.keyChain.keypairs.find(kp => kp.publicKey === identity.publicKey)
        signature.token = signature.toSignature(kp)
        const next = identity as IdentitySub
        next.token = signature.token
        if (!fromLocal) 
            params.scatter.keyChain.signatures.push(signature)
        params.scatter.storage()
        return next
    }

    static getOrRequestIdentity(params: IGetOrRequestIdentity) {
        const identity = this.identityFromPermissionsOrNull(params.domain, params.scatter)
        const sendBackIdentity = (async (id: Identity, fromPermission?: boolean) => {
            if (!id) {
                params.callback(null, false)
            } else if (fromPermission) {
                const hex = UtilsHelper.signatureHex(identity.publicKey, params.domain)
                const signature = params.scatter.keyChain.signatures.filter(e => e.hex === hex)[0]
                const next = id.asOnlyRequiredFields(params.fields) as IdentitySub
                next.token = signature.token
                params.callback(next, fromPermission)
            } else {
                let next = id.asOnlyRequiredFields(params.fields)
                next = this.createSign(params, next as Identity)
                params.callback(next as Identity, fromPermission)
            }
        })
        if (identity) {
            const hex = UtilsHelper.signatureHex(identity.publicKey, params.domain)
            const signature = params.scatter.keyChain.signatures.filter(e => e.hex === hex)[0]
            if (identity.hasRequiredFields(params.fields)) {
                if (signature && signature.payload.exp > +new Date()) {
                    sendBackIdentity(identity, true)
                    return
                }
            }
        }
        const prompt = new Prompt(
            ConstKeys.FO_REQUEST_IDENTITY,
            params.domain,
            params.network,
            params.fields,
            sendBackIdentity,
            params.scatter
        )
        NotificationHelper.openWindow(prompt)
    }
}