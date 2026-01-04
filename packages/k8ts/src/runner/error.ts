export class K8tsEngineError extends Error {
    name = "K8tsEngineError" as const
    constructor(message: string, fields: Record<string, any> & { cause?: Error } = {}) {
        super(message)
        Object.assign(this, fields)
    }
}
