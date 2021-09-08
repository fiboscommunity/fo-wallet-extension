import CustomError from '../models/CustomError'

export default class UtilsHelper {
	/**
	 * 组装存储在本地的abikey
	 * @param contract 
	 * @param chainId 
	 */
    static getAbiKey(contract: string, chainId: string): string {
        return `abi_${contract}_${chainId}`
    }

	/**
	 * 获取scatter key
	 */
    static getScatterKey(): string {
        return 'kScatter1'
    }

	/**
	 * 返回错误对象
	 * @param code 状态码
	 * @param error 错误类型
	 */
    static createError(code: number, error: string): CustomError {
        return new CustomError(code, error)
    }

	/**
	 * 比较版本
	 * @param oldV 旧版版本号
	 * @param newV 新版本号
	 */
    static compareVersion(oldV: string, newV: string): boolean {
        if (!oldV || !newV) {
            return false
        }
        const o = oldV.split('.')
        const n = newV.split('.')
        for (let i = 0; i < o.length; i++) {
            if (parseInt(o[i], 10) > parseInt(n[i], 10)) {
                return false
            }
            if (parseInt(o[i], 10) < parseInt(n[i], 10)) {
                return true
            }
        }
        return false
    }

	/**
	 * 获取主机名
	 */
    static host(win: Window): string {
        const _host = win.location.hostname
        if (_host.startsWith('www.'))
            return _host.substring(4, _host.length)
        return _host
    }

    /**
     * 获取端口
     * @param win 
     */
    static port(win: Window): number {
        const port = win.location.port
        if (port.length > 0)
            return parseInt(port, 10)
        const _protocol = this.protocol(win)
        return _protocol === 'https' ? 443 : 80
    }

    /**
     * 获取协议
     * @param win 
     */
    static protocol(win: Window): string {
        let _host = win.location.protocol
        if (_host.endsWith(':'))
            _host = _host.substr(0, _host.length - 1)
        return _host
    }

	/**
	 * 格式化私钥 (4个为一组)
	 * @param privatekey 私钥
	 */
    static fmtPrivateKey(privatekey: string): string {
        if (privatekey.length <= 0) {
            return privatekey
        }
        let str = privatekey
        const array = []
        while (str.length > 4) {
            array.push(str.substring(0, 4))
            str = str.substr(4, str.length)
        }
        if (str.length > 0) {
            array.push(str)
        }
        return array.join(' ')
    }

    /**
     * string转Uint8Array
     * @param str 
     */
    static string2UintArray(str: string): Uint8Array {
        const chars = []
        for (let i = 0; i < str.length; i++)
            chars.push(str.charCodeAt(i))
        return new Uint8Array(chars)
    }

    /**
     * 获取签名的key
     * @param publicKey 
     * @param domain 
     */
    static signatureHex(publicKey: string, domain: string): string {
        const withoutPrefix = publicKey.substr(publicKey.length - 50, 50)
        return `${withoutPrefix}_${domain}`
    }
}