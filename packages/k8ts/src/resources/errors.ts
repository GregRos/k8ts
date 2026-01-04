export class K8tsResourceError extends Error {
    name = "K8tsResourceError" as const
    constructor(message: string, fields: Record<string, any> & { cause?: Error } = {}) {
        super(message)
        Object.assign(this, fields)
    }
}
