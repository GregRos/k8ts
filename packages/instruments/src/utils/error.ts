export class K8tsMixinError extends Error {
    override name = "K8tsMixinError"
    constructor(message: string, extra: Record<string, any> = {}) {
        super(message)
        Object.assign(this, extra)
    }
}
