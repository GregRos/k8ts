export class K8tsWorkloadToolsError extends Error {
    override name = "K8tsWorkloadToolsError" as const
    constructor(message: string, fields: Record<string, any> & { cause?: Error } = {}) {
        super(message)
        Object.assign(this, fields)
    }
}
