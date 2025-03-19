export namespace Backend {
    export interface HostPath {
        type: "HostPath"
        path: string
    }
    export interface Local {
        type: "Local"
        path: string
    }

    export type Backend = HostPath | Local
}

export type Backend = Backend.Backend
