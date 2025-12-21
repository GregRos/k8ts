import { seq } from "doddle"
import { MetadataError } from "./error"
import type { InputMeta, MetaInputParts } from "./input/dict-input"
import { parseKey, parseMetaInput } from "./key"
import { pNameValue } from "./key/parse-key"
import { checkMetaString, ValueKey, type SectionKey } from "./key/repr"
import { Key } from "./key/types"
import { orderMetaKeyedObject } from "./order-meta-keyed-object"
import { equalsMap, toJS } from "./util"
export type Meta = Meta.Meta
export type MutableMeta = Meta.MutableMeta
const MetaMarker = Symbol("k8ts.org/metadata")
export interface MetaLike {
    readonly [MetaMarker]: true
}
export namespace Meta {
    export function _checkNameValue(what: string, v: string) {
        if (!pNameValue.parse(v).isOk) {
            throw new MetadataError(`Invalid ${what}: ${v}`)
        }
        checkMetaString(what, v, 63)
    }
    export function _checkValue(key: string, v: string) {
        const parsed = parseKey(key)
        if (!(parsed instanceof ValueKey)) {
            throw new MetadataError(`Expected value key, got section key for ${key}`)
        }
        if (parsed.metaType === "label") {
            checkMetaString(`value of ${key}`, v, 63)
        } else if (parsed.metaType === "core") {
            _checkNameValue(`value of ${key}`, v)
        }
    }
    export type Input = InputMeta
    export class Meta implements Iterable<[ValueKey, string]>, MetaLike {
        readonly [MetaMarker] = true
        constructor(private readonly _dict: Map<string, string>) {
            for (const [key, value] of _dict.entries()) {
                _checkValue(key, value)
            }
        }

        *[Symbol.iterator]() {
            for (const entry of this._dict.entries()) {
                yield [parseKey(entry[0]) as ValueKey, entry[1]] as [ValueKey, string]
            }
        }
        protected _create(raw: Map<string, string>) {
            return new Meta(raw)
        }
        clone() {
            return this._create(new Map(this._dict))
        }
        add(key: Key.Value, value: string): Meta
        add(key: Key.Section, value: MetaInputParts.Nested): Meta
        add(input: InputMeta): Meta
        add(a: any, b?: any) {
            const parsed = _pairToMap([a, b])
            for (const [k, v] of parsed) {
                if (this._dict.has(k)) {
                    const prev = this._dict.get(k)
                    throw new MetadataError(`Duplicate entry for ${k}, was ${prev} now ${v}`, {
                        key: (k as any).str
                    })
                }
                this._dict.set(k, v)
            }
            return this
        }

        equals(other: Meta.Input) {
            return equalsMap(this._dict, make(other)._dict)
        }

        section(key: string) {
            const newS = seq(this).map(([k, v]) => [k.section(key), v] as const)
            return parseMetaInput(newS)
        }

        overwrite(key: Key.Value, value: string): Meta
        overwrite(key: Key.Section, value: MetaInputParts.Nested): Meta
        overwrite(input?: InputMeta): Meta
        overwrite(a?: any, b?: any) {
            if (a === undefined) {
                return this
            }
            const fromPair = _pairToMap([a, b])
            for (const [k, v] of fromPair.entries()) {
                this._dict.set(k, v)
            }
            return this
        }

        has<X extends Key.Value>(key: X) {
            const parsed = parseKey(key)
            if (parsed instanceof ValueKey) {
                return this._dict.has(key)
            } else {
                return this._matchSectionKeys(parsed).size > 0
            }
        }

        get(key: Key.Value) {
            const parsed = parseKey(key)
            const v = this._dict.get(key)
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
            return this._dict.get(key) ?? fallback
        }

        private _matchSectionKeys(key: SectionKey) {
            return seq(this)
                .filter(([k, v]) => k.parent?.equals(key) ?? false)
                .toMap(x => [x[0].str, x[1]] as const)
                .pull()
        }

        pick(...keySpecs: Key.Key[]) {
            const parsed = keySpecs.map(parseKey)
            const keyStrSet = new Set<string>()
            for (const key of parsed) {
                if (key instanceof ValueKey) {
                    keyStrSet.add(key.str)
                } else {
                    const sectionKeys = this._matchSectionKeys(key)
                    for (const k of sectionKeys.keys()) {
                        keyStrSet.add(k)
                    }
                }
            }
            const out = new Map<string, string>()
            for (const [k, v] of this._dict.entries()) {
                if (keyStrSet.has(k)) out.set(k, v)
            }
            return this._create(out)
        }

        private _prefixed(prefix: string) {
            const out: { [k: string]: string } = {}
            for (const [k, v] of this) {
                if (k._prefix === prefix) {
                    out[k.suffix] = v
                }
            }
            return orderMetaKeyedObject(out)
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
            return toJS(this._dict)
        }

        get keys(): ValueKey[] {
            return seq(this)
                .map(([k, v]) => k)
                .toArray()
                .pull()
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
            const parsed = parseKey(a)
            if (parsed instanceof ValueKey) {
                this._dict.delete(parsed.str)
                return this
            }
            if (b !== undefined) {
                // remove specific key from section
                for (const k of this.keys) {
                    if (k.parent?.equals(parsed) && k.suffix === b) {
                        this._dict.delete(k.str)
                    }
                }
                return this
            }
            // remove entire section
            for (const k of this.keys) {
                if (k.parent?.equals(parsed)) this._dict.delete(k.str)
            }
            return this
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
    }

    export function make(key: Key.Value, value: string): Meta
    export function make(key: Key.Section, value: MetaInputParts.Nested): Meta
    export function make(input?: InputMeta): Meta
    export function make(a?: any, b?: any) {
        return new Meta(_pairToMap([a, b]))
    }
    function _pairToObject(pair: [string | ValueKey, string | object] | [object]) {
        let [key, value] = pair
        key = key instanceof ValueKey ? key.str : key
        if (typeof key === "string") {
            return {
                [key]: value as string
            }
        }
        return key
    }
    function _pairToMap(pair: [string | ValueKey, string | object] | [object]) {
        return parseMetaInput(_pairToObject(pair))
    }

    export function splat(...input: InputMeta[]) {
        return input.map(make).reduce((acc, meta) => acc.add(meta), make())
    }

    export function is(value: any): value is Meta {
        return value instanceof Meta
    }

    export class MutableMeta extends Meta {
        // MutableMeta is now just a direct extension of Meta so callers
        // that expect MutableMeta keep working. The class body is empty
        // because all mutation behavior lives on `Meta` itself.
        constructor(...args: any[]) {
            // Construct as a Meta instance. `Meta` constructor signature
            // expects a Map<ValueKey, string> which callers provide when
            // creating mutable instances.
            super(args[0])
        }
    }
}
