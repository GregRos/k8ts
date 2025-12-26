import { MakeError } from "../../../error"
import type { Pv_Backend } from "./pv"
export function parseBackend(backend?: Pv_Backend) {
    switch (backend?.kind) {
        case undefined:
        case null:
            return {}
        case "HostPath":
            return {
                hostPath: {
                    path: backend.path,
                    type: backend.hostpathType
                }
            }
        case "Local":
            return {
                local: {
                    path: backend.path
                }
            }
        case "NFS":
            return {
                nfs: {
                    server: backend.server,
                    path: backend.path
                }
            }
        default:
            throw new MakeError(`Unknown backend kind!`, {
                backend
            })
    }
}
