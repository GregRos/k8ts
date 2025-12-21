import { InstrumentsError } from "../../../../error"

export class ProxyOperationError extends InstrumentsError {
    constructor(message: string, details: Record<string, any> = {}) {
        super(message, details)
    }
}
