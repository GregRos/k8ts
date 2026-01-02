export class K8tsQuantityError extends Error {
    name = "K8tsQuantityError" as const

    constructor(message: string, fields: Record<string, any> & { cause?: Error } = {}) {
        super(message)
        Object.assign(this, fields)
    }
}
