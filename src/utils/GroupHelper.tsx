export default class GroupHelper {
    /**
     * 数组分组
     * @param array 数组
     * @param by 分组依据
     */
    static groupBy<T>(array: Array<T>, by: string): { [key: string]: Array<T> } {
        var resp: { [key: string]: Array<T> } = {}
        for (let i = 0; i < array.length; i++) {
            const item = array[i]
            const val = (item as any)[by]
            if (resp[val] === undefined) {
                resp[val] = [item]
            } else {
                resp[val].push(item)
            }
        }
        return resp
    }
}