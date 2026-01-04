export class K8tsEnvError extends Error {
    override name = "EnvError" as const
    constructor(message: string, details: Record<string, any> = {}) {
        super(message)
        Object.assign(this, details)
    }
}
