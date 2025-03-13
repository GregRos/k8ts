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
    [key: string]: JsonSerializable
    [key: number]: never
    [key: symbol]: never
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
