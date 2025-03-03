export class UnitError extends Error {
    constructor(message: string, extra: Record<string, any> = {}) {
        super(message)
        Object.assign(this, extra)
    }
}
