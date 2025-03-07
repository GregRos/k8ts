import { MakeError } from "../../../error"
import { HostPath, Local } from "./backend"
export function parseBackend(backend: HostPath | Local) {
    switch (backend.type) {
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
