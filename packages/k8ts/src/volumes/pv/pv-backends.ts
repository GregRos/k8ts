export interface PV_Backend_Local {
    type: "Local"
    path: string
}

export interface PV_Backend_HostPath {
    type: "HostPath"
    path: string
}

export function parseBackend(backend: PV_Backend_Local | PV_Backend_HostPath) {
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
