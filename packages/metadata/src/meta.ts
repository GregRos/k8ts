import { seq } from "doddle"
import { MetadataError } from "./error"
import type { InputMeta, MetaInputParts } from "./input/dict-input"
import { parseKey, parseMetaInput } from "./key"
import { parseInnerKey, parseSectionKey, pNameValue } from "./key/parse-key"
import { checkMetaString, MetadataKey, type DomainPrefix } from "./key/repr"
import { Key } from "./key/types"
import { orderMetaKeyedObject } from "./order-meta-keyed-object"
import { equalsMap, toJS } from "./util"
export type Meta = Meta.Meta
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
        if (!(parsed instanceof MetadataKey)) {
            throw new MetadataError(`Expected value key, got section key for ${key}`)
        }
        if (parsed.metaType === "label") {
            checkMetaString(`value of ${key}`, v, 63)
        } else if (parsed.metaType === "core") {
            _checkNameValue(`value of ${key}`, v)
        }
    }
    export type Input = InputMeta
    /**
     * Mutable storage for k8s metadata. K8s metadata includes labels, annotations, and core fields.
     * These are addressed using `CharPrefix`.
     *
     * - **Labels**: `%key` → `metadata.labels.key`
     * - **Annotations**: `^key` → `metadata.annotations.key`
     * - **Comments**: `#key` → Build-time metadata, not manifested in k8s objects.
     * - **Core metadata**: `key` → `metadata.key` (e.g., `name`, `namespace`, etc.)
     *
     * In addition, you can address different metadata keys under the same domain using a
     * `DomainKey`, of the form `example.com/`. When using a `DomainKey`, you use a `CharPrefix` on
     * the inner keys.
     *
     * This lets you add different kinds of metadata under the same domain with ease.
     *
     * @example
     *     meta.add("%app", "my-app") // adds label 'app' with value 'my-app'
     *     meta.add("example.section/", {
     *         "%label1": "value1", // adds `%example.section/label1` with value 'value1'
     *         "^annotation1": "value2" // adds `^example.section/annotation1` with value 'value2'
     *     })
     */
    export class Meta implements Iterable<[MetadataKey, string]>, MetaLike {
        readonly [MetaMarker] = true
        /**
         * Constructs a new Meta instance from a map of key-value pairs. Validates all keys and
         * values during construction.
         *
         * @param _dict Internal map storing metadata key-value pairs
         * @throws {MetadataError} If any key or value is invalid
         */
        constructor(private readonly _dict: Map<string, string>) {
            for (const [key, value] of _dict.entries()) {
                _checkValue(key, value)
            }
        }

        /**
         * Makes Meta instances iterable, yielding [ValueKey, string] pairs.
         *
         * @example
         *     for (const [key, value] of meta) {
         *         console.log(key.str, value)
         *     }
         */
        *[Symbol.iterator]() {
            for (const entry of this._dict.entries()) {
                yield [parseKey(entry[0]) as MetadataKey, entry[1]] as [MetadataKey, string]
            }
        }
        protected _create(raw: Map<string, string>) {
            return new Meta(raw)
        }
        /**
         * Creates a deep clone of this object.
         *
         * @returns
         */
        clone() {
            return this._create(new Map(this._dict))
        }

        /**
         * Deletes a single value key from the metadata.
         *
         * @example
         *     meta.delete("name") // deletes core metadata 'name'
         *     meta.delete("%app") // deletes label 'app'
         *
         * @param key The value key to delete
         */
        delete(key: Key.Value): Meta

        /**
         * Deletes specific keys under a domain prefix.
         *
         * @example
         *     meta.delete("example.com/", "key1", "key2") // deletes specific keys in section
         *
         * @param ns The section key namespace
         * @param keys Specific value keys within the section to delete
         */
        delete(ns: Key.Domain, ...keys: Key.Value[]): Meta

        /**
         * Deletes all keys within a section namespace.
         *
         * @example
         *     meta.delete("example.com/") // deletes all keys in section
         *
         * @param ns The section key namespace to delete
         */
        delete(ns: Key.Domain): Meta
        delete(a: any, ...rest: any[]) {
            if (a.endsWith("/")) {
                const sectionKey = parseSectionKey(a)
                const onlyKeys = rest.map(parseInnerKey)
                if (onlyKeys.length > 0) {
                    var deleteOnly = (key: MetadataKey) => onlyKeys.some(ok => ok.equals(key))
                } else {
                    var deleteOnly = (_key: MetadataKey) => _key.domain().equals(sectionKey)
                }
                for (const k of this._keys) {
                    if (deleteOnly(k)) {
                        this._dict.delete(k.str)
                    }
                }
            } else {
                this._dict.delete(a)
            }
            return this
        }

        /**
         * Adds a single key-value pair to the metadata. Throws if the key already exists.
         *
         * @example
         *     meta.add("%app", "my-app") // adds label
         *     meta.add("name", "my-resource") // adds core metadata
         *
         * @param key The value key to add
         * @param value The value to associate with the key
         */
        add(key: Key.Value, value?: string): Meta

        /**
         * Adds a nested object of key-value pairs within a section namespace. Throws if any key
         * already exists.
         *
         * @example
         *     meta.add("example.com/", { "%label": "value", "^annotation": "data" })
         *
         * @param key The section key namespace
         * @param value Nested object containing key-value pairs
         */
        add(key: Key.Domain, value: MetaInputParts.Nested): Meta

        /**
         * Adds multiple key-value pairs from an input object. Throws if any key already exists.
         *
         * @example
         *     meta.add({ "%app": "my-app", name: "my-resource" })
         *
         * @param input Object or map containing key-value pairs to add
         */
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

        /**
         * Compares this Meta instance to another for equality. Two instances are equal if they
         * contain the same key-value pairs.
         *
         * @param other The other Meta instance or input to compare against
         * @returns Whether the two Meta instances are equal
         */
        equals(other: Meta.Input) {
            return equalsMap(this._dict, make(other)._dict)
        }

        /**
         * Overwrites a single key-value pair, replacing any existing value.
         *
         * @example
         *     meta.overwrite("%app", "new-app") // replaces existing label value
         *
         * @param key The value key to overwrite
         * @param value The new value (undefined removes the key)
         */
        overwrite(key: Key.Value, value: string | undefined): Meta

        /**
         * Overwrites key-value pairs within a section namespace.
         *
         * @example
         *     meta.overwrite("example.com/", { "%label": "new-value" })
         *
         * @param key The section key namespace
         * @param value Nested object containing key-value pairs to overwrite
         */
        overwrite(key: Key.Domain, value: MetaInputParts.Nested): Meta

        /**
         * Overwrites multiple key-value pairs from an input object.
         *
         * @example
         *     meta.overwrite({ "%app": "new-app", name: "new-name" })
         *
         * @param input Object or map containing key-value pairs to overwrite
         */
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

        /**
         * Checks if a key with a given domain prefix exists in the metadata.
         *
         * @example
         *     meta.has("example.com/") // Checks for any key with this domain
         *     meta.has("%app") // Checks for the label 'app'
         *
         * @param domainPrefix The domain prefix to check for
         * @returns True if any keys exist under the specified domain prefix, false otherwise
         */
        has(domainPrefix: Key.Domain): boolean
        /** @param key */
        has(key: Key.Value): boolean
        has(key: any) {
            const parsed = parseKey(key)
            if (parsed instanceof MetadataKey) {
                return this._dict.has(key)
            } else {
                return this._matchDomainPrefixes(parsed).size > 0
            }
        }

        /**
         * Retrieves the value for the specified key. Throws if the key doesn't exist.
         *
         * @example
         *     const appName = meta.get("%app")
         *
         * @param key The value key to retrieve
         * @returns The value associated with the key
         * @throws {MetadataError} If the key is not found
         */
        get(key: Key.Value) {
            const parsed = parseKey(key)
            const v = this._dict.get(key)
            if (v === undefined) {
                throw new MetadataError(`Key ${key} not found!`, { key })
            }
            return v
        }

        /**
         * Attempts to retrieve the value for the specified key, returning a fallback if not found.
         *
         * @example
         *     const appName = meta.tryGet("%app", "default-app")
         *
         * @param key The value key to retrieve
         * @param fallback Optional fallback value if key doesn't exist
         * @returns The value associated with the key, or the fallback value
         * @throws {MetadataError} If a domain key is provided instead of a value key
         */
        tryGet(key: Key.Value, fallback?: string) {
            const parsed = parseKey(key)
            if (!(parsed instanceof MetadataKey)) {
                throw new MetadataError("Unexpected domain key!", { key })
            }
            return this._dict.get(key) ?? fallback
        }

        private _matchDomainPrefixes(key: DomainPrefix) {
            return seq(this)
                .filter(([k, v]) => k.parent?.equals(key) ?? false)
                .toMap(x => [x[0].str, x[1]] as const)
                .pull()
        }

        /**
         * Creates a new Meta instance containing only some of the keys. You can pass both entire
         * keys and domain prefixes to include all keys under that domain.
         *
         * @example
         *     const subset = meta.pick("%app", "name", "example.com/")
         *
         * @param keySpecs Keys or domain prefixes to include in the result
         * @returns A new Meta instance with only the picked keys
         */
        pick(...keySpecs: (Key.Domain | Key.Value)[]) {
            const parsed = keySpecs.map(parseKey)
            const keyStrSet = new Set<string>()
            for (const key of parsed) {
                if (key instanceof MetadataKey) {
                    keyStrSet.add(key.str)
                } else {
                    const sectionKeys = this._matchDomainPrefixes(key)
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
                if (k.prefix() === prefix) {
                    out[k.suffix] = v
                }
            }
            return orderMetaKeyedObject(out)
        }

        /**
         * Returns all labels as a plain object that can be embedded into a k8s manifest, with keys
         * in canonical order.
         *
         * @example
         *     const labels = Meta.make({
         *         "%app": "my-app",
         *         "%tier": "backend"
         *     }).labels
         *     // { app: "my-app", tier: "backend" }
         */
        get labels() {
            return this._prefixed("%")
        }

        /**
         * Returns all annotations as a plain object that can be embedded into a k8s manifest, with
         * keys in canonical order.
         *
         * @example
         *     const annotations = Meta.make({
         *         "^note": "This is important",
         *         "^description": "Detailed info"
         *     }).annotations
         *     // { note: "This is important", description: "Detailed info" }
         */
        get annotations() {
            return this._prefixed("^")
        }

        /**
         * Returns all comments (build-time metadata) as a plain object, with keys in canonical
         * order.
         *
         * @example
         *     const comments = Meta.make({
         *         "#note": "Internal use only"
         *     }).comments
         *     // { note: "Internal use only" }
         */
        get comments() {
            return this._prefixed("#")
        }
        /**
         * Returns all core metadata fields (`name` and `namespace`) as a plain object that can be
         * embedded into a k8s manifest, with keys in canonical order.
         *
         * @example
         *     const core = meta.core // { name: "my-resource", namespace: "default" }
         */
        get core() {
            return this._prefixed("") as {
                [key in Key.Special]?: string
            }
        }

        /**
         * Returns all metadata key-value pairs as a flat JavaScript object, with each key prefixed
         * appropriately.
         *
         * @example
         *     const all = Meta.make({
         *         "%app": "my-app",
         *         "^note": "This is important",
         *         name: "my-resource"
         *     }).values
         *     // { "%app": "my-app", "^note": "This is important", "name": "my-resource" }
         */
        get values() {
            return toJS(this._dict)
        }

        private get _keys(): MetadataKey[] {
            return seq(this)
                .map(([k, v]) => k)
                .toArray()
                .pull()
        }
    }

    /**
     * Creates a Meta instance with a single key-value pair.
     *
     * @example
     *     const meta = Meta.make("%app", "my-app")
     *
     * @param key The value key
     * @param value The value to associate with the key
     */
    export function make(key: Key.Value, value: string): Meta

    /**
     * Creates a Meta instance with key-value pairs within a section namespace.
     *
     * @example
     *     const meta = Meta.make("example.com/", { "%label": "value" })
     *
     * @param key The section key namespace
     * @param value Nested object containing key-value pairs
     */
    export function make(key: Key.Domain, value: MetaInputParts.Nested): Meta

    /**
     * Creates a Meta instance from an input object or returns an empty Meta if no input provided.
     *
     * @example
     *     const meta = Meta.make({ "%app": "my-app", name: "resource" })
     *     const empty = Meta.make()
     *
     * @param input Object or map containing key-value pairs
     */
    export function make(input?: InputMeta): Meta
    export function make(a?: any, b?: any) {
        return new Meta(_pairToMap([a, b]))
    }
    function _pairToObject(pair: [string | MetadataKey, string | object] | [object]) {
        let [key, value] = pair
        key = key instanceof MetadataKey ? key.str : key
        if (typeof key === "string") {
            return {
                [key]: value as string
            }
        }
        return key
    }
    function _pairToMap(pair: [string | MetadataKey, string | object] | [object]) {
        return parseMetaInput(_pairToObject(pair))
    }
}
