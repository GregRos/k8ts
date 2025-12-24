import type { Ref2_Of } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { isObject } from "what-are-you"
import { MakeError } from "../error"
import { v1 } from "../kinds/index"
import { type Env_From, type Env_Leaf, type Env_Value } from "./types"
import { isValidEnvVarName } from "./validate-name"

export class EnvBuilder<M extends Record<keyof M, Env_Leaf>> {
    constructor(private readonly _env: M) {
        for (const key of Object.keys(_env)) {
            if (!isValidEnvVarName(key)) {
                throw new MakeError("Invalid environment variable name", {
                    key: key
                })
            }
        }
    }

    get values() {
        return this._env
    }

    private _envFromSecret(value: Env_From): CDK.EnvVarSource {
        return {
            secretKeyRef: {
                name: value.$backend.name,
                key: value.key,
                optional: value.optional
            }
        }
    }

    private _envFromConfigMap<S extends Ref2_Of<v1.ConfigMap._>>(
        value: Env_From
    ): CDK.EnvVarSource {
        return {
            configMapKeyRef: {
                name: value.$backend.name,
                key: value.key,
                optional: value.optional
            }
        }
    }

    *[Symbol.iterator](): IterableIterator<[string, Env_Value]> {
        for (const entry of Object.entries(this._env)) {
            yield entry as any
        }
    }

    toEnvVars() {
        return seq(this)
            .map(([key, value]) => {
                if (!isObject(value)) {
                    return {
                        name: key,
                        value: `${value}`
                    }
                }
                const resourceValue = value as any
                switch (resourceValue.$backend.kind) {
                    case v1.Secret._:
                        return {
                            name: key,
                            valueFrom: this._envFromSecret(resourceValue as any)
                        } satisfies CDK.EnvVar
                    case v1.ConfigMap._:
                        return {
                            name: key,
                            valueFrom: this._envFromConfigMap(resourceValue as any)
                        } satisfies CDK.EnvVar
                    default:
                        throw new MakeError("Invalid environment variable reference", {
                            key: key,
                            value: value
                        })
                }
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
        return Object.entries(this._env) as [string, Env_Leaf][]
    }

    static make<M>(env?: M) {
        return new EnvBuilder(env ?? {})
    }
}

export function Env<
    M extends {
        [key in keyof M]: Env_Leaf
    }
>(env?: M) {
    return EnvBuilder.make(env)
}
