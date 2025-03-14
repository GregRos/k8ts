import { ManifestResource } from "../node"

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
export const SOURCE = Symbol.for("k8ts/manifest-source")
export interface BaseManifest {
    [key: string]: JsonSerializable
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

const manifestToSource = new WeakMap<BaseManifest, ManifestResource>()
export function getK8tsResourceObject(manifest: BaseManifest) {
    const resource = manifestToSource.get(manifest)
    if (!resource) {
        throw new Error("No resource found for manifest")
    }
    return resource
}

export function setK8tsResourceObject(manifest: BaseManifest, resource: ManifestResource) {
    manifestToSource.set(manifest, resource)
    return manifest
}
