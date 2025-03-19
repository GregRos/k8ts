import type { EnvBuilder } from "./env"

export type InputEnvMapping = Partial<
    Record<string, string | null | number | boolean | bigint | undefined>
>

export type InputEnv = EnvBuilder | InputEnvMapping
