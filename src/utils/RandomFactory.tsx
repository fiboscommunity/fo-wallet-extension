export default class RandomFactory {

    /**
     * 随机数
     */
    static random(): number {
        return Math.random()
    }

    /**
     * 生成随机字符串
     * @param size 长度
     */
    static string(size: number, forceUpperCase: boolean = false): string {
        size = size << 0
        const chars: Array<string> = []
        const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for (let i = 0; i < size; i++)
            chars.push(str.charAt((RandomFactory.random() * str.length) << 0))
        if (forceUpperCase)
            return chars.join('').toUpperCase()
        return chars.join('')
    }

    /**
     * 生成随机数字
     * @param size 长度
     */
    static number(size: number): string {
        size = Math.max(0, size << 0)
        const chars: Array<string> = []
        const str = "0123456789"
        for (let i = 0; i < size; i++)
            chars.push(str.charAt((RandomFactory.random() * str.length) << 0))
        return chars.join('')
    }

    /**
     * 获取iv向量
     */
    static iv(): string {
        return this.string(16, true)
    }

    /**
     * 系统所有加密处的盐
     */
    static systemSalt(): string {
        const chars: Array<string> = [
            String.fromCharCode(51),
            String.fromCharCode(68),
            String.fromCharCode(80),
            String.fromCharCode(99),
            String.fromCharCode(117),
            String.fromCharCode(103),
            String.fromCharCode(97),
            String.fromCharCode(114),
            String.fromCharCode(105),
            String.fromCharCode(99),
            String.fromCharCode(81),
            String.fromCharCode(67),
            String.fromCharCode(76),
            String.fromCharCode(100),
            String.fromCharCode(85),
            String.fromCharCode(65),
        ]
        return chars.join('').toUpperCase()
    }

    /**
     * 获取创建账户的盐
     * @param array ascii数组
     */
    static createSalt(array: Array<number>): string {
        const resp: Array<string> = []
        for (let i = 0; i < array.length; i++) {
            if (i % 2 !== 0) {
                resp.unshift(String.fromCharCode(array[i]))
            }
        }
        return resp.join('')
    }

    /**
     * 生成uuid
     */
    static uuid(): string {
        let ts = +new Date()
        const uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (ts + Math.random() * 16) % 16 | 0
            ts = Math.floor(ts / 16)
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase()
        })
        return uuid.toUpperCase()
    }
}