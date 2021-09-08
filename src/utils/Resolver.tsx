export default class Resolver {
    public readonly id: string
    public readonly resolve: (val?: any) => void
    public readonly reject: (reason?: any) => void

    constructor(_id: string, _resolve: (val?: string) => void, _reject: (reason?: string) => void) {
        this.id = _id
        this.resolve = _resolve
        this.reject = _reject
    }
}