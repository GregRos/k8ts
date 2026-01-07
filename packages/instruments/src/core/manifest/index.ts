import { Embedder } from "../../utils/mixin/embedder"
import { Resource } from "../graph/resource/resource"
export interface K8tsManifest_Metadata {
    labels: Record<string, string>
    annotations: Record<string, string>
    name: string
    namespace?: string
}
export interface K8tsManifest_GKV {
    kind: string
    apiVersion: string
}

export type JsonSerializable =
    | string
    | number
    | boolean
    | null
    | JsonSerializable[]
    | { [key: string]: JsonSerializable }

export interface K8tsManifest extends K8tsManifest_GKV {
    [key: number]: never
    metadata?: K8tsManifest_Metadata
}

export const ManifestSourceEmbedder = new Embedder<object, Resource>("ManifestSource")
