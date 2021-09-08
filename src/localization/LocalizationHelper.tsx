import { LanguageEnum } from '../models/Enum'

export default class LocalizationHelper {
    private static lan: LanguageEnum = LanguageEnum.chinese

    /**
     * 设置语言环境
     * @param _lan 语言环境
     */
    static setLan(_lan: LanguageEnum) {
        this.lan = _lan
    }

    /**
     * 根据key获取文案
     * @param key key
     */
    static valueForKey(key: string): string {
        switch (this.lan) {
            case LanguageEnum.english:
                return require('./english.json')[key]
            default:
                return require('./zh_hans.json')[key]
        }
    }
}