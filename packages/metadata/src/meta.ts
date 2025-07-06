import { Map, Set } from "immutable"
import { MetadataError } from "./error"
import type { InputMeta, MetaInputParts } from "./input/dict-input"
import { parseKey, parseMetaInput } from "./key"
import { pNameValue } from "./key/parse-key"
import { checkMetaString, ValueKey, type SectionKey } from "./key/repr"
import { Key as Key_ } from "./key/types"
export type Meta = Meta.Meta
export type MutableMeta = Meta.MutableMeta
export namespace Meta {
    export function _checkNameValue(what: string, v: string) {
        if (!pNameValue.parse(v).isOk) {
            throw new MetadataError(`Invalid ${what}: ${v}`)
        }
        checkMetaString(what, v, 63)
    }
    export function _checkValue(key: ValueKey, v: string) {
        if (key.metaType === "label") {
            checkMetaString(`value of ${key.str}`, v, 63)
        } else if (key.metaType === "core") {
            _checkNameValue(`value of ${key.str}`, v)
        }
    }
    export type Input = InputMeta
    export import Key = Key_
    export class Meta implements Iterable<[ValueKey, string]> {
        constructor(private readonly _dict: Map<ValueKey, string>) {
            for (const [key, value] of _dict.entries()) {
                _checkValue(key, value)
            }
        }

        [Symbol.iterator]() {
            return this._dict.entries()[Symbol.iterator]()
        }
        protected _create(raw: Map<ValueKey, string>) {
            return new Meta(raw)
        }
        private _createWith(f: (raw: Map<ValueKey, string>) => Map<ValueKey, string>) {
            return this._create(f(this._dict))
        }
        add(key: Key.Value, value: string): Meta
        add(key: Key.Section, value: MetaInputParts.Nested): Meta
        add(input: InputMeta): Meta
        add(a: any, b?: any) {
            return this._createWith(raw => {
                const parsed = _pairToMap([a, b])
                const newMap = raw.mergeWith((prev, cur, key) => {
                    throw new MetadataError(`Duplicate entry for ${key}, was ${prev} now ${cur}`, {
                        key: key.str
                    })
                }, parsed)
                return newMap
            })
        }

        equals(other: Meta.Input) {
            return this._dict.equals(make(other)._dict)
        }

        section(key: string) {
            return this._createWith(raw => {
                return raw.mapKeys(k => k.section(key))
            })
        }

        overwrite(key: Key.Value, value: string): Meta
        overwrite(key: Key.Section, value: MetaInputParts.Nested): Meta
        overwrite(input?: InputMeta): Meta
        overwrite(a?: any, b?: any) {
            if (a === undefined) {
                return this
            }
            return this._createWith(raw => {
                const fromPair = _pairToMap([a, b])
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
                throw new MetadataError(`Key ${key} not found!`, { key })
            }
            return v
        }

        tryGet(key: Key.Value, fallback?: string) {
            const parsed = parseKey(key)
            if (!(parsed instanceof ValueKey)) {
                throw new MetadataError("Unexpected section key!", { key })
            }
            return this._dict.get(parsed) ?? fallback
        }

        private _matchSectionKeys(key: SectionKey) {
            return this._dict.filter((_, k) => k.parent?.equals(key))
        }

        pick(...keySpecs: Key.Key[]) {
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

        get values() {
            return this._dict.toJS()
        }

        get core() {
            return this._prefixed("") as {
                [key in Key.Special]?: string
            }
        }
        remove(key: Key.Value): this
        remove(ns: Key.Section, key: string): this
        remove(ns: Key.Section): this
        remove(a: any, b?: any) {
            return this._createWith(raw => {
                const parsed = parseKey(a)
                if (parsed instanceof ValueKey) {
                    return raw.delete(parsed)
                } else {
                    return raw.filter((_, k) => !k.parent?.equals(parsed))
                }
            })
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

        toMutable() {
            return new MutableMeta(this)
        }
    }

    export function make(key: Key.Value, value: string): Meta
    export function make(key: Key.Section, value: MetaInputParts.Nested): Meta
    export function make(input?: InputMeta): Meta
    export function make(a?: any, b?: any) {
        return new Meta(_pairToMap([a, b]))
    }
    function _pairToObject(pair: [string, string | object] | [object]) {
        const [key, value] = pair
        if (key instanceof Meta) {
            return Map(key)
        }
        if (typeof key === "string") {
            return {
                [key]: value as string
            }
        }
        return key
    }
    function _pairToMap(pair: [string, string | object] | [object]) {
        return parseMetaInput(_pairToObject(pair)).filter((v, k) => v != null)
    }
    export function makeMutable(input: InputMeta = {}) {
        return make(input).toMutable()
    }

    export function splat(...input: InputMeta[]) {
        return input.map(make).reduce((acc, meta) => acc.add(meta), make())
    }

    export function is(value: any): value is Meta {
        return value instanceof Meta
    }

    export class MutableMeta {
        constructor(private _meta: Meta) {}

        add(key: Key.Value, value: string): this
        add(key: Key.Section, value: MetaInputParts.Nested): this
        add(input: InputMeta): this
        add(a: any, b?: any) {
            this._meta = this._meta.add(a, b)
            return this
        }

        remove(key: Key.Value): this
        remove(ns: Key.Section, key: string): this
        remove(ns: Key.Section): this
        remove(a: any, b?: any) {
            this._meta = this._meta.remove(a, b)
            return this
        }

        overwrite(key: Key.Value, value: string): this
        overwrite(key: Key.Section, value: MetaInputParts.Nested): this
        overwrite(input?: InputMeta): this
        overwrite(a?: any, b?: any) {
            this._meta = this._meta.overwrite(a, b)
            return this
        }
        equals(other: Meta.Input) {
            return this._meta.equals(other)
        }
        get(key: Key.Value) {
            return this._meta.get(key)
        }

        tryGet(key: Key.Value, fallback?: string) {
            return this._meta.tryGet(key, fallback)
        }

        has(key: Key.Value) {
            return this._meta.has(key)
        }

        pick(...keySpecs: Key.Key[]) {
            const newMeta = this._meta.pick(...keySpecs)
            return new MutableMeta(newMeta)
        }

        toMutable() {
            return new MutableMeta(this._meta)
        }

        section(key: string) {
            return new MutableMeta(this._meta.section(key))
        }
        get labels() {
            return this._meta.labels
        }

        get annotations() {
            return this._meta.annotations
        }

        get comments() {
            return this._meta.comments
        }

        get core() {
            return this._meta.core
        }

        toImmutable() {
            return this._meta
        }
    }
}
