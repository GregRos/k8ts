export namespace Backend {
    export interface HostPath {
        type: "HostPath"
        path: string
    }
    export interface Local {
        type: "Local"
        path: string
    }
    export interface NFS {
        type: "NFS"
        server: string
        path: string
    }

    export type Backend = HostPath | Local | NFS
}

export type Backend = Backend.Backend
