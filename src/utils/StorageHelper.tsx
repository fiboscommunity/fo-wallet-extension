import apis from '../utils/ApiHelper'
import FOScatter from '../models/FOScatter'
import UtilsHelper from './UtilsHelper'

class StorageHelper {
    /**
     * 存储key value
     * @param key 
     * @param value 
     */
    public save<T>(key: string, value: T): Promise<void> {
        return new Promise((resolve) => {
            apis.storage.local.set({ [key]: value }, () => resolve())
        })
    }

    /**
     * 获取scatter
     */
    public async getScatter(): Promise<FOScatter> {
        const val = await this.get<FOScatter>(UtilsHelper.getScatterKey())
        if (!val)
            return FOScatter.generate()
        return FOScatter.deserialize(val)
    }

    /**
     * 根据key取出value
     * @param key 
     */
    public get<T>(key: string): Promise<T> {
        return new Promise((resolve) => {
            apis.storage.local.get(key, (val: { [key: string]: T }) => resolve(val[key]))
        })
    }

    /**
     * 根据Key 删除 value
     * @param key 
     */
    public remove(key: string): Promise<void> {
        return new Promise((resolve) => {
            apis.storage.local.remove(key, () => resolve())
        })
    }

    /**
     * 清除所有kv
     */
    public clear(): Promise<void> {
        return new Promise((resolve) => {
            apis.storage.local.clear(() => resolve())
        })
    }

}

export default new StorageHelper()