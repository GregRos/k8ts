import type { Ref2_Of } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { merge } from "lodash"
import { isObject } from "what-are-you"
import { MakeError } from "../error"
import { v1 } from "../kinds/index"
import { type EnvVarFrom, type InputEnvMapping, type InputEnvValue } from "./types"
import { isValidEnvVarName } from "./validate-name"

export class EnvBuilder<M extends InputEnvMapping = InputEnvMapping> {
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

    private _envFromSecret<S extends Ref2_Of<v1.Secret._>>(value: EnvVarFrom<S>): CDK.EnvVarSource {
        return {
            secretKeyRef: {
                name: value.$backend.name,
                key: value.key,
                optional: value.optional
            }
        }
    }

    private _envFromConfigMap<S extends Ref2_Of<v1.ConfigMap._>>(
        value: EnvVarFrom<S>
    ): CDK.EnvVarSource {
        return {
            configMapKeyRef: {
                name: value.$backend.name,
                key: value.key,
                optional: value.optional
            }
        }
    }

    *[Symbol.iterator](): IterableIterator<[string, InputEnvValue]> {
        for (const entry of Object.entries(this._env)) {
            yield entry
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
                const resourceValue = value as EnvVarFrom
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
    private _withEnv(f: (env: InputEnvMapping) => InputEnvMapping) {
        return new EnvBuilder(f(this._env))
    }

    add(name: string, value: InputEnvMapping[string]): EnvBuilder
    add(input: InputEnvMapping): EnvBuilder
    add(a: any, b?: any) {
        const pairs: [string, string][] = typeof a === "string" ? [[a, b]] : Object.entries(a)
        const map = new Map(pairs)
        const existingKeys = seq(map.keys())
            .filter(k => k in this._env)
            .toArray()
            .pull()
        if (existingKeys.length > 0) {
            throw new MakeError("Cannot overwrite existing keys using add", {
                keys: existingKeys
            })
        }
        return this._withEnv(env => merge({}, env, map))
    }

    overwrite(name: string, value: string): EnvBuilder
    overwrite(input: InputEnvMapping): EnvBuilder
    overwrite(a: any, b?: any) {
        if (typeof a === "string") {
            return this._withEnv(env => {
                return {
                    ...env,
                    [a]: b
                }
            })
        } else {
            return this._withEnv(env => merge({}, env, this._env))
        }
    }

    toObject() {
        return seq(this)
            .filter(([, v]) => v != null)
            .toRecord(([k, v]) => [k, `${v}`])
            .pull()
    }

    static make<M>(env?: M) {
        return new EnvBuilder(env ?? {})
    }
}

export function Env<
    M extends {
        [key in keyof M]: InputEnvValue
    }
>(env?: M) {
    return EnvBuilder.make(env)
}
