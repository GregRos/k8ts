export class PortError extends Error {
    override name = "PortError"
    constructor(message: string, extra: Record<string, any> = {}) {
        super(message)
        this.name = "PortError"
        Object.assign(this, extra)
    }
}
