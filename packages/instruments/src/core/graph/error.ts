export class K8tsGraphError extends Error {
    override name = "K8tsGraphError" as const
    constructor(message: string, fields: Record<string, any> & { cause?: Error } = {}) {
        super(message)
        Object.assign(this, fields)
    }
}
