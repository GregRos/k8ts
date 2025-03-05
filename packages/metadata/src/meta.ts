import { Map, Set } from "immutable"
import { MetadataError } from "./error"
import type { InputMeta, MetaInputParts } from "./input/dict-input"
import { parseKey, parsePlainObject } from "./key"
import { ValueKey, type SectionKey } from "./key/repr"
import type { Key } from "./key/types"
const DICT = Symbol("dict")
export class Meta {
    private [DICT] = true
    constructor(private readonly _dict: Map<ValueKey, string>) {}

    protected _create(raw: Map<ValueKey, string>) {
        return new Meta(raw)
    }
    private _createWith(f: (raw: Map<ValueKey, string>) => Map<ValueKey, string>) {
        return this._create(f(this._dict))
    }
    add(key: Key.Value, value: string): Meta
    add(key: Key.Section, value: MetaInputParts.Nested): Meta
    add(input: MetaInputParts.Input): Meta
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
        if (key instanceof Meta) {
            return key._dict
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

    overwrite(key: Key.Value, value: string): Meta
    overwrite(key: Key.Section, value: MetaInputParts.Nested): Meta
    overwrite(input: MetaInputParts.Input): Meta
    overwrite(a: any, b?: any) {
        return this._createWith(raw => {
            const fromPair = this._pairToMap([a, b])
            return raw.merge(fromPair)
        })
    }

    has<X extends Key.Value>(key: X) {
        const parsed = parseKey(key)
        if (parsed instanceof ValueKey) {
            return this._dict.has(parsed)
        } else {
            return this._matchSectionKeys(parsed).size > 0
        }
    }

    get(key: Key.Value) {
        const parsed = parseKey(key)
        const v = this._dict.get(parsed as ValueKey)
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
        return this._dict.get(parsed)
    }

    private _matchSectionKeys(key: SectionKey) {
        return this._dict.filter((_, k) => k.parent?.equals(key))
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
        return this._dict
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

    get comments() {
        return this._prefixed("#")
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

    static make(input: InputMeta = {}) {
        return new Meta(parsePlainObject(input))
    }
}
