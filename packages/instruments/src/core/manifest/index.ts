import { Embedder } from "../../utils/_embedder"
import { ResourceEntity } from "../entities/resource/resource-node"
export interface ManifestMetadata {
    labels: Record<string, string>
    annotations: Record<string, string>
    name: string
    namespace?: string
}
export interface ManifestIdentFields {
    kind: string
    apiVersion: string
}
export interface BuilderInputTypes {
    body: PreManifest
    metadata?: ManifestMetadata
    idents?: ManifestIdentFields
}

export type JsonSerializable =
    | string
    | number
    | boolean
    | null
    | JsonSerializable[]
    | { [key: string]: JsonSerializable }

export interface PreManifest {
    metadata?: {
        name?: string
        namespace?: string
        annotations?: Record<string, string>
        labels?: Record<string, string>
    }
}
export interface BaseManifest {
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

export interface SpecManifest<T extends JsonSerializable> extends BaseManifest {
    spec: T
}

export const ManifestSourceEmbedder = new Embedder<object, ResourceEntity>("ManifestSource")
