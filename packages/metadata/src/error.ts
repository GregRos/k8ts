export class MetadataError extends Error {
    override name = "MetadataError"
    constructor(message: string, extra: Record<string, any> = {}) {
        super(message)
        Object.assign(this, extra)
    }
}
