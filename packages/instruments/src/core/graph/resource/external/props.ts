import type { IdentKind } from "../api-kind"

export interface ExternalFeatures {
    keys?: string[]
}
export interface ExternalKindToFeatures {
    ConfigMap: {
        keys?: string[]
    }
    Secret: {
        keys?: string[]
    }
    [s: string]: {}
}

export type ExternalProps<K extends IdentKind> = ExternalKindToFeatures[K["name"]]
