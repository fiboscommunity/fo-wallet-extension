import { EncryptedStream, LocalStream } from 'extension-streams'
import * as ConstKeys from './constKeys/ConstKeys'
import MessageNotify from './utils/MessageNotify'
import Identity from './models/Identity'
import UtilsHelper from './utils/UtilsHelper'
import apis from './utils/ApiHelper'
import NetworkSession from './utils/NetworkSession'
import Network from './models/Network'
import { stringToProtocolEnum } from './models/Enum'
import StorageHelper from './utils/StorageHelper'

class Content {
    private isReady: boolean = false
    private stream: typeof EncryptedStream
    constructor() {
        this.initEncryptedStream()
        this.injectJs()
    }

	/**
	 * 实例化加密流
	 */
    initEncryptedStream() {
        this.stream = new EncryptedStream(ConstKeys.FO_STREAM)
        this.stream.listenWith((msg: { [key: string]: any }) => this.msgHandler(msg))
        this.stream.onSync(async () => {
            const version = await this.getVersion()
            const identity = await this.identityFromPermissions(UtilsHelper.host(window))

            const scatter = await StorageHelper.getScatter()
            const { networks } = scatter.setting
            const notify = new MessageNotify(ConstKeys.CREATE_FO_DAPP, {
                version, identity, networks
            })

            this.stream.send(notify, ConstKeys.FO_INJECTED)
            this.isReady = true
            document.dispatchEvent(new CustomEvent("ironmanLoaded"))
        })
    }

    injectJs() {
        let script = document.createElement('script');
        script.src = apis.extension.getURL('inject.js');
        (document.head || document.documentElement).appendChild(script);
        script.onload = () => script.remove();
    }

    msgHandler(msg: { [key: string]: any }) {
        if (!this.isReady) return
        if (!msg) return
        if (!this.stream.synced && (!msg.hasOwnProperty('type') || msg.type !== 'sync')) {
            this.stream.send(new MessageNotify(ConstKeys.FO_SYNC_FORBID), ConstKeys.FO_INJECTED)
            return
        }
        const host = UtilsHelper.host(window)
        const port = UtilsHelper.port(window)
        const protocol = UtilsHelper.protocol(window)
        const network = new Network({
            name: '',
            protocol: stringToProtocolEnum(protocol),
            host,
            port,
            blockchain: ConstKeys.kFIBOS,
            chainId: ''
        })
        msg.domain = host
        if (msg.hasOwnProperty('payload'))
            msg.payload.domain = msg.domain
        msg.payload.network = network
        const message = MessageNotify.deserialize(msg)
        switch (message.type) {
            case 'sync':
                this.sync(message)
                break
            case ConstKeys.GET_REQUEST_IDENTITY:
                this.getRequestIdentity(message)
                break
            case ConstKeys.FO_REQUEST_SIGN:
                this.requesSign(message)
                break
            case ConstKeys.FORGET_IDENTITY:
                this.forgetIdentity(message)
                break
            case ConstKeys.REQUEST_ATTRIBUTE_SIGN:
                this.requestAttributeSign(message)
                break
            case ConstKeys.REFRESH_IDENTITY:
                this.refreshIdentity(message)
                break
        }
    }

    respond(message: NetworkSession, payload: any) {
        if (!this.isReady) return;
        const response = (!payload || payload.isError)
            ? message.error(payload)
            : message.respond(payload);
        this.stream.send(response, ConstKeys.FO_INJECTED);
    }

    getVersion(): Promise<string> {
        return new MessageNotify(ConstKeys.GET_VERSION).send()
    }

    identityFromPermissions(domain: string): Promise<Identity> {
        return new MessageNotify(ConstKeys.FO_IDENTITY_FROM_PERMISSION, {
            domain
        }).send()
    }

    sync(message: any): void {
        this.stream.key = message.handshake.length > 0 ? message.handshake : null
        this.stream.send(new MessageNotify('sync'), ConstKeys.FO_INJECTED)
        this.stream.synced = true
    }

    getRequestIdentity(message: MessageNotify): Promise<Identity> {
        if (!this.isReady) return
        return new MessageNotify(ConstKeys.GET_REQUEST_IDENTITY, message.payload)
            .send().then((res: Identity) => this.respond(NetworkSession.deserialize(message), res))
    }

    refreshIdentity(message: MessageNotify): Promise<Identity> {
        if (!this.isReady) return
        return new MessageNotify(ConstKeys.REFRESH_IDENTITY, message.payload)
            .send().then((res: Identity) => this.respond(NetworkSession.deserialize(message), res))
    }

    requesSign(message: MessageNotify): Promise<Identity> {
        if (!this.isReady) return
        return new MessageNotify(ConstKeys.FO_REQUEST_SIGN, message.payload)
            .send().then((res: any) => this.respond(NetworkSession.deserialize(message), res))
    }

    forgetIdentity(message: MessageNotify) {
        if (!this.isReady) return
        return new MessageNotify(ConstKeys.FORGET_IDENTITY, message.payload)
            .send().then((res: boolean) => this.respond(NetworkSession.deserialize(message), res))
    }

    requestAttributeSign(message: MessageNotify) {
        if (!this.isReady) return
        return new MessageNotify(ConstKeys.REQUEST_ATTRIBUTE_SIGN, message.payload)
            .send().then((res: boolean) => this.respond(NetworkSession.deserialize(message), res))
    }

}

new Content()