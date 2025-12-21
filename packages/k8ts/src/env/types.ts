import type { Kind, Resource_Core_Ref } from "@k8ts/instruments"
import { EnvBuilder } from "./env"

export type InputEnvValue = string | null | number | boolean | bigint | undefined | EnvVarFrom
export type InputEnvMapping = Partial<Record<string, InputEnvValue>>
export interface EnvVarFrom<_Kind extends Kind = Kind> {
    $ref: Resource_Core_Ref<_Kind>
    key: string
    optional?: boolean
}

export type InputEnv = EnvBuilder | InputEnvMapping | InputEnvMap

export function toInputEnv(env: InputEnv): InputEnvMap {
    if (env instanceof EnvBuilder) {
        return new Map(env["_env"])
    }
    if (env instanceof Map) {
        return new Map(env)
    }
    return new Map(Object.entries(env))
}
export type EnvFrom<_Kind extends Kind = Kind> = {
    $ref: Resource_Core_Ref<_Kind>
    prefix?: string
}
export type InputEnvMap = Map<string, InputEnvValue>
