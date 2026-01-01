import type { IdentKind } from "../api-kind"

export interface External_Features {
    keys?: string[]
}
export interface External_KindToFeatures {
    ConfigMap: {
        keys?: string[]
    }
    Secret: {
        keys?: string[]
    }
    [s: string]: {}
}

export type External_Props<K extends IdentKind> = External_KindToFeatures[K["name"]]
