export default class SignaturePayload {
    /**
     * 颁发者
     */
    public iss: string = ""
    /**
     * 主题
     */
    public sub: string = ""
    /**
     * 域或者bundleid (插件：域名  app：bundleid)
     */
    public aud: string = ""
    /**
     * 颁发时间
     */
    public iat: number = 0
    /**
     * 过期时间
     */
    public exp: number = 0
    /**
     * 签名的唯一标识
     */
    public jti: string = ""

    constructor(iss: string = "", sub: string = "", 
        aud: string = "", iat: number = 0, exp: number = 0,
        jti: string = "") {
        this.iss = iss
        this.sub = sub
        this.aud = aud
        this.iat = iat
        this.exp = exp
        this.jti = jti
    }

    /**
     * 序列化
     */
    public serialize(): string {
        return JSON.stringify(this)
    }

    /**
     * 反序列化
     * @param json json字符串
     */
    static deserialize(json: { [key: string]: any }): SignaturePayload {
        return Object.assign(new SignaturePayload(), json)
    }
}