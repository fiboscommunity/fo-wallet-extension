import { LocalStream } from 'extension-streams'

export default class MessageNotify {
    public readonly type: string
    public readonly payload: any
    constructor(_type: string = '', _payload: any = '') {
        this.type = _type
        this.payload = _payload
    }

    /**
     * 构造一个空的实例
     */
    static generate(): MessageNotify {
        return new MessageNotify('', '')
    }

    /**
     * json 2 model
     * @param json json
     */
    static deserialize(json: { [key: string]: any }): MessageNotify {
        return Object.assign(this.generate(), json)
    }

    /**
     * model 2 string
     */
    static serialize(): string {
        return JSON.stringify(this)
    }

    /**
     * 发送消息
     */
    send() {
        return LocalStream.send(this)
    }
}