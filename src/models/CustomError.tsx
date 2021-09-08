export default class CustomError {
    public readonly code: number
    public readonly descript: string
    public readonly isError: boolean = true

    constructor(_code: number, _descript: string) {
        this.code = _code
        this.descript = _descript
    }
}