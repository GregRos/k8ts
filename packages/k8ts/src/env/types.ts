import type { Kind, Refable } from "@k8ts/instruments"
import type { EnvBuilder } from "./env"

export type InputEnvValue = string | null | number | boolean | bigint | undefined | EnvVarFrom
export type InputEnvMapping = Partial<Record<string, InputEnvValue>>
export interface EnvVarFrom<_Kind extends Kind = Kind> {
    $ref: Refable<_Kind>
    key: string
    optional?: boolean
}

export type InputEnv = EnvBuilder | InputEnvMapping

export type EnvFrom<_Kind extends Kind = Kind> = {
    $ref: Refable<_Kind>
    prefix?: string
}
