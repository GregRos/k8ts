export class K8tsProxyError extends Error {
    name = "K8tsProxyError" as const
    constructor(message: string, details: Record<string, any> = {}) {
        super(message)
        Object.assign(this, details)
    }
}
