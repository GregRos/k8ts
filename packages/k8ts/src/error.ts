export class MakeError extends Error {
    override name = "MakeError"
    constructor(message: string, details: Record<string, any> = {}) {
        super(message)
        Object.assign(this, details)
    }
}
