import type { CDK } from "@k8ts/imports"
import { merge } from "@k8ts/metadata/util"
import { seq } from "doddle"
import { isObject } from "what-are-you"
import { MakeError } from "../error"
import { api_ } from "../kinds"
import {
    toInputEnv,
    type EnvVarFrom,
    type InputEnv,
    type InputEnvMap,
    type InputEnvMapping,
    type InputEnvValue
} from "./types"
import { isValidEnvVarName } from "./validate-name"
export class EnvBuilder {
    constructor(private readonly _env: InputEnvMap) {
        for (const key of _env.keys()) {
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

    private _envFromSecret(value: EnvVarFrom<api_.v1_.Secret>): CDK.EnvVarSource {
        return {
            secretKeyRef: {
                name: value.$ref.name,
                key: value.key,
                optional: value.optional
            }
        }
    }

    private _envFromConfigMap(value: EnvVarFrom<api_.v1_.ConfigMap>): CDK.EnvVarSource {
        return {
            configMapKeyRef: {
                name: value.$ref.name,
                key: value.key,
                optional: value.optional
            }
        }
    }

    *[Symbol.iterator](): IterableIterator<[string, InputEnvValue]> {
        for (const entry of this._env.entries()) {
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
                const resourceValue = value as EnvVarFrom<api_.v1_.Secret | api_.v1_.ConfigMap>
                switch (resourceValue.$ref.kind) {
                    case api_.v1_.Secret:
                        return {
                            name: key,
                            valueFrom: this._envFromSecret(resourceValue as any)
                        }
                    case api_.v1_.ConfigMap:
                        return {
                            name: key,
                            valueFrom: this._envFromConfigMap(resourceValue as any)
                        }
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
    private _withEnv(f: (env: InputEnvMap) => InputEnvMap) {
        return new EnvBuilder(f(this._env))
    }

    add(name: string, value: InputEnvMapping[string]): EnvBuilder
    add(input: InputEnvMapping): EnvBuilder
    add(a: any, b?: any) {
        const pairs: [string, string][] = typeof a === "string" ? [[a, b]] : Object.entries(a)
        const map = new Map(pairs)
        const existingKeys = seq(map.keys())
            .filter(k => this._env.has(k))
            .toArray()
            .pull()
        if (existingKeys.length > 0) {
            throw new MakeError("Cannot overwrite existing keys using add", {
                keys: existingKeys
            })
        }
        return this._withEnv(env => merge(env, map))
    }

    overwrite(name: string, value: string): EnvBuilder
    overwrite(input: InputEnvMapping): EnvBuilder
    overwrite(a: any, b?: any) {
        if (typeof a === "string") {
            return this._withEnv(env => env.set(a, b))
        } else {
            const map = toInputEnv(a)
            return this._withEnv(env => merge(env, map))
        }
    }

    toObject() {
        return seq(this)
            .filter(([, v]) => v != null)
            .toRecord(([k, v]) => [k, `${v}`])
            .pull()
    }

    static make(env?: InputEnv) {
        return new EnvBuilder(toInputEnv(env ?? {}))
    }
}

export function Env(env?: InputEnvMapping) {
    return EnvBuilder.make(env)
}
