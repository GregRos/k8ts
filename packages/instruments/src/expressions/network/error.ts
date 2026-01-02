export class K8tsNetworkError extends Error {
    name = "K8tsNetworkError"
    constructor(message: string, fields: Record<string, any> & { cause?: Error } = {}) {
        super(message)
        Object.assign(this, fields)
    }
}
