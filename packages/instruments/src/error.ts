export class InstrumentsError extends Error {
    constructor(message: string, details: Record<string, any> = {}) {
        super(message)
        Object.assign(this, details)
    }
}
