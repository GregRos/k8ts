import { Map, type MapOf } from "immutable"
import { InstrumentsError } from "../error"
import type { InputEnv, InputEnvMapping } from "./types"
import { isValidEnvVarName } from "./validate-name"

type _EnvBuilderMap = MapOf<InputEnvMapping>
export class EnvBuilder {
    constructor(private readonly _env: _EnvBuilderMap) {
        for (const key of _env.keys()) {
            if (!isValidEnvVarName(key)) {
                throw new InstrumentsError("Invalid environment variable name", {
                    key: key
                })
            }
        }
    }

    get values() {
        return this._env
    }

    private _withEnv(f: (env: _EnvBuilderMap) => _EnvBuilderMap) {
        return new EnvBuilder(f(this._env))
    }

    add(name: string, value: string): EnvBuilder
    add(input: InputEnvMapping): EnvBuilder
    add(a: any, b?: any) {
        const pairs: [string, string][] = typeof a === "string" ? [[a, b]] : Object.entries(a)
        const map = Map(pairs)
        const existingKeys = map
            .keySeq()
            .filter(k => this._env.has(k))
            .toList()
        if (existingKeys.size > 0) {
            throw new InstrumentsError("Cannot overwrite existing keys using add", {
                keys: existingKeys.toArray()
            })
        }
        return this._withEnv(env => env.merge(map) as any)
    }

    overwrite(name: string, value: string): EnvBuilder
    overwrite(input: InputEnvMapping): EnvBuilder
    overwrite(a: any, b?: any) {
        if (typeof a === "string") {
            return this._withEnv(env => env.set(a, b))
        } else {
            const map = Map(a as InputEnvMapping) as _EnvBuilderMap
            return this._withEnv(env => env.merge(map) as any)
        }
    }

    toObject() {
        return this._env
            .filter(v => v != null)
            .map(x => `${x}`)
            .toObject()
    }

    static make(env?: InputEnv) {
        if (!env) {
            return new EnvBuilder(Map({}))
        }
        if (env instanceof EnvBuilder) {
            return env
        }
        return new EnvBuilder(Map(env ?? {}).filter(v => v != null) as _EnvBuilderMap)
    }
}

export function Env(env?: InputEnvMapping) {
    return EnvBuilder.make(env)
}
