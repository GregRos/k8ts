import type { Kind } from "../api-kind"

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

export type External_Props<K extends Kind.KindLike> = External_KindToFeatures[K["name"]]
