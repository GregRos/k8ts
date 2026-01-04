import { Embedder } from "../../utils/mixin/embedder"
import { Resource } from "../graph/resource/resource"
export interface K8tsManifest_Metadata {
    labels: Record<string, string>
    annotations: Record<string, string>
    name: string
    namespace?: string
}
export interface K8tsManifest_Ident {
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

export interface K8tsManifest extends K8tsManifest_Ident {
    [key: number]: never
    metadata: {
        name: string
        namespace?: string
        labels?: Record<string, string>
        annotations?: Record<string, string>
    }
}

export const ManifestSourceEmbedder = new Embedder<object, Resource>("ManifestSource")
