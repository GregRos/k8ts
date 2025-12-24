import type { Ref2_Of } from "@k8ts/instruments"

export type Env_Value = string | null | number | boolean | bigint | undefined
export interface Env_From {
    $backend: Ref2_Of
    key: string
    optional?: boolean
}

export type Env_Leaf = string | null | number | boolean | bigint | undefined | Env_From
