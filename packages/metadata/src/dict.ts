import { Map, Set } from "immutable"
import { MetadataError } from "./error"
import { parseKey, parsePlainObject } from "./key"
import { ValueKey, type SectionKey } from "./key/repr"
import type { Dictx, Key } from "./key/types"
const DICT = Symbol("dict")
export class Dict {
    private [DICT] = true
    constructor(private readonly _raw: Map<ValueKey, string>) {}

    protected _create(raw: Map<ValueKey, string>) {
        return new Dict(raw)
    }
    private _createWith(f: (raw: Map<ValueKey, string>) => Map<ValueKey, string>) {
        return this._create(f(this._raw))
    }
    add(key: Key.Value, value: string): Dict
    add(key: Key.Section, value: Dictx.Nested): Dict
    add(input: Dictx.Full): Dict
    add(a: any, b?: any) {
        return this._createWith(raw => {
            const parsed = this._pairToMap([a, b])
            const newMap = raw.mergeWith((prev, cur, key) => {
                throw new MetadataError(`Duplicate entry for ${key}, was ${prev} now ${cur}`, {
                    key: key.str
                })
            }, parsed)
            return newMap
        })
    }

    private _pairToObject(pair: [string, string | object] | [object]) {
        const [key, value] = pair
        if (key instanceof Dict) {
            return key._raw
        }
        if (typeof key === "string") {
            return {
                [key]: value as string
            }
        }
        return key
    }

    private _pairToMap(pair: [string, string | object] | [object]) {
        return parsePlainObject(this._pairToObject(pair))
    }

    overwrite(key: Key.Value, value: string): Dict
    overwrite(key: Key.Section, value: Dictx.Nested): Dict
    overwrite(input: Dictx.Full): Dict
    overwrite(a: any, b?: any) {
        return this._createWith(raw => {
            const fromPair = this._pairToMap([a, b])
            return raw.merge(fromPair)
        })
    }

    has(key: Key.Value) {
        const parsed = parseKey(key)
        if (parsed instanceof ValueKey) {
            return this._raw.has(parsed)
        } else {
            return this._matchSectionKeys(parsed).size > 0
        }
    }

    get(key: Key.Value) {
        const parsed = parseKey(key)
        const v = this._raw.get(parsed as ValueKey)
        if (v === undefined) {
            throw new MetadataError("Key not found!", { key })
        }
        return v
    }

    tryGet(key: Key.Value) {
        const parsed = parseKey(key)
        if (!(parsed instanceof ValueKey)) {
            throw new MetadataError("Unexpected section key!", { key })
        }
        return this._raw.get(parsed)
    }

    private _matchSectionKeys(key: SectionKey) {
        return this._raw.filter((_, k) => k.parent?.equals(key))
    }

    pick(...keySpecs: Key.Any[]) {
        return this._createWith(raw => {
            const parsed = keySpecs.map(parseKey)
            let keySet = Set()
            for (const key of parsed) {
                if (key instanceof ValueKey) {
                    keySet = keySet.add(key)
                } else {
                    const sectionKeys = this._matchSectionKeys(key)
                    keySet = keySet.union(sectionKeys.keySeq())
                }
            }
            return raw.filter((_, k) => keySet.has(k))
        })
    }

    private _prefixed(prefix: string) {
        return this._raw
            .filter((_, k) => k._prefix === prefix)
            .mapKeys(k => k.suffix)
            .toObject()
    }

    get labels() {
        return this._prefixed("%")
    }

    get annotations() {
        return this._prefixed("^")
    }

    get core() {
        return this._prefixed("") as {
            [key in Key.Special]?: string
        }
    }

    expand() {
        const labels = this.labels
        const annotations = this.annotations
        const core = this.core
        return {
            ...core,
            labels,
            annotations
        }
    }

    static from(input: Dictx.Full) {
        return new Dict(parsePlainObject(input))
    }
}
