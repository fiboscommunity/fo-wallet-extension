import { EncryptedStream } from 'extension-streams'
import * as ConstKeys from './constKeys/ConstKeys'
import RandomFactory from './utils/RandomFactory'
import FODApp from './utils/FODApp'
import Network from './models/Network'

class Inject {
    private stream: typeof EncryptedStream
    constructor() {
        this.initStream()
    }

    initStream(): void {
        this.stream = new EncryptedStream(ConstKeys.FO_INJECTED, RandomFactory.string(64))
        this.stream.listenWith((msg: { [key: string]: any }) => {
            if (msg && msg.hasOwnProperty('type') && msg.type === ConstKeys.CREATE_FO_DAPP) {
                let win: any = window
                
                 const dapper = new FODApp(this.stream, msg.payload)

                 dapper.hotPlugin(msg.payload.networks as Array<Network>)

                 win.ironman = dapper
            }
        })
        // 发送初始化完成消息
        this.stream.sync(ConstKeys.FO_STREAM, this.stream.key)
    }
}

new Inject()