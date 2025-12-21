export class InstrumentsError extends Error {
    override get name() {
        return this.constructor.name
    }
    constructor(message: string, details: Record<string, any> = {}) {
        super(message)
        Object.assign(this, details)
    }
}
