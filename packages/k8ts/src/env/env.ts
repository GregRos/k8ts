import type { ResourceRef } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { isPrimitive } from "what-are-you"
import { v1 } from "../idents"
import { K8tsEnvError } from "./error"
import { type EnvValue, type EnvValueSource } from "./types"
import { isValidEnvVarName } from "./validate-name"

export class EnvBuilder<M extends Record<keyof M, EnvValue>> {
    constructor(private readonly _env: M) {
        for (const key of Object.keys(_env)) {
            if (!isValidEnvVarName(key)) {
                throw new K8tsEnvError("Invalid environment variable name", {
                    key: key
                })
            }
        }
    }

    get values() {
        return this._env
    }

    private _envFromSecret(value: EnvValueSource): CDK.EnvVarSource {
        return {
            secretKeyRef: {
                name: value.$backend.ident.name,
                key: value.key,
                optional: value.optional
            }
        }
    }

    private _envFromConfigMap<S extends ResourceRef<v1.ConfigMap._>>(
        value: EnvValueSource
    ): CDK.EnvVarSource {
        return {
            configMapKeyRef: {
                name: value.$backend.ident.name,
                key: value.key,
                optional: value.optional
            }
        }
    }

    *[Symbol.iterator](): IterableIterator<[string, EnvValue]> {
        for (const entry of Object.entries(this._env)) {
            yield entry as any
        }
    }

    toEnvVars() {
        return seq(this)
            .map(([key, value]) => {
                if (isPrimitive(value)) {
                    return {
                        name: key,
                        value: `${value}`
                    }
                }
                if (value.$backend.is(v1.Secret._)) {
                    return {
                        name: key,
                        valueFrom: this._envFromSecret(value as any)
                    } satisfies CDK.EnvVar
                }
                if (value.$backend.is(v1.ConfigMap._)) {
                    return {
                        name: key,
                        valueFrom: this._envFromConfigMap(value as any)
                    } satisfies CDK.EnvVar
                }
                throw new K8tsEnvError("Invalid environment variable reference", {
                    key: key,
                    value: value
                })
            })
            .toArray()
            .pull()
    }

    toObject() {
        return seq(this)
            .filter(([, v]) => v != null)
            .toRecord(([k, v]) => [k, `${v}`])
            .pull()
    }

    get entries() {
        return Object.entries(this._env) as [string, EnvValue][]
    }

    static make<M>(env?: M) {
        return new EnvBuilder(env ?? {})
    }
}

export function Env<
    M extends {
        [key in keyof M]: EnvValue
    }
>(env?: M) {
    return EnvBuilder.make(env)
}
