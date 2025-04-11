import { MakeError } from "../../../error"
import { Backend } from "./backend"
export function parseBackend(backend?: Backend) {
    switch (backend?.type) {
        case undefined:
        case null:
            return {}
        case "HostPath":
            return {
                hostPath: {
                    path: backend.path,
                    type: backend.type
                }
            }
        case "Local":
            return {
                local: {
                    path: backend.path
                }
            }
        default:
            throw new MakeError(`Unknown backend kind!`, {
                backend
            })
    }
}
