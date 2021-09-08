export interface IApiHelper {
    app: {[key: string]: any}
    storage: {[key: string]: any}
    extension: {[key: string]: any}
    runtime: {[key: string]: any}
    windows: {[key: string]: any}
}

class ApiHelper implements IApiHelper {
    app: { [key: string]: any }
    storage: { [key: string]: any }
    extension: { [key: string]: any }
    runtime: { [key: string]: any }
    windows: { [key: string]: any }
    constructor() {
        this.app = this.storage = this.extension = this.runtime = this.windows = {}
        this.init()
    }

    init(): void {
        ['app', 'storage', 'extension', 'runtime', 'windows'].forEach(api => {
            let self: any = this
            let win: any = window
            self[api] = win.chrome[api]
        })
    }
}
export default new ApiHelper()