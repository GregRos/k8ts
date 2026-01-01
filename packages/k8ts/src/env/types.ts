import type { ResourceRef } from "@k8ts/instruments"

export type EnvValuePrimitive = string | null | number | boolean | bigint | undefined
export interface EnvValueSource {
    $backend: ResourceRef
    key: string
    optional?: boolean
}

export type EnvValue = EnvValuePrimitive | EnvValueSource
