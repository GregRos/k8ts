import { Embedder } from "../../utils/embedder"
import { Resource } from "../graph/resource/entity"
export interface ManifestMetadata {
    labels: Record<string, string>
    annotations: Record<string, string>
    name: string
    namespace?: string
}
export interface ManifestIdent {
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

export interface Manifest {
    [key: number]: never
    apiVersion: string
    kind: string
    metadata: {
        name: string
        namespace?: string
        labels?: Record<string, string>
        annotations?: Record<string, string>
    }
}

export interface SpecManifest<T extends JsonSerializable> extends Manifest {
    spec: T
}

export const ManifestSourceEmbedder = new Embedder<object, Resource>("ManifestSource")
