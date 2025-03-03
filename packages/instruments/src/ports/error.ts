export class PortError extends Error {
    constructor(message: string, extra: Record<string, any> = {}) {
        super(message)
        this.name = "PortError"
        Object.assign(this, extra)
    }
}
