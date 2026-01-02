export class DataSourceError extends Error {
    k8ts = true as const
    name = "DataSourceError" as const
    constructor(message: string, fields: Record<string, any> & { cause?: Error } = {}) {
        super(message)
        Object.assign(this, fields)
    }
}
