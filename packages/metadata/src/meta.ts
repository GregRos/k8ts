import { seq } from "doddle"
import { K8tsMetadataError } from "./error"
import { parseInnerKey, parseKey, parseMetaInput, parseSectionKey } from "./input"
import type { Metadata_Input, MetaInputParts } from "./input/dict-input"
import { type Metadata_Key_Domain } from "./input/key/domain-prefix"
import { Metadata_Key_Value } from "./input/key/metadata-key"
import type {
    Metadata_Key_sDomain,
    Metadata_Key_sValue,
    NotPrefixed
} from "./input/key/string-types"
import { equalsMap, toJS } from "./utils/map"
import { orderMetaKeyedObject } from "./utils/order-meta-keyed-object"
import { checkMetadataValue } from "./utils/validate"

/**
 * Mutable storage for k8s metadata. K8s metadata includes labels, annotations, and core fields.
 * These are addressed using `CharPrefix`.
 *
 * - **Labels**: `%key` → `metadata.labels.key`
 * - **Annotations**: `^key` → `metadata.annotations.key`
 * - **Comments**: `#key` → Build-time metadata, not manifested in k8s objects.
 * - **Core metadata**: `key` → `metadata.key` (e.g., `name`, `namespace`, etc.)
 *
 * In addition, you can address different metadata keys under the same domain using a `DomainKey`,
 * of the form `example.com/`. When using a `DomainKey`, you use a `CharPrefix` on the inner keys.
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
export class Metadata implements Iterable<[Metadata_Key_sValue, string]> {
    private readonly _dict: Map<Metadata_Key_sValue, string>

    /**
     * Constructs a Metadata instance with a single key-value pair.
     *
     * @example
     *     const meta = new Metadata("%app", "my-app")
     *
     * @param key The value key
     * @param value The value to associate with the key
     */
    constructor(key: Metadata_Key_sValue, value: string)
    /**
     * Constructs a Metadata instance with key-value pairs within a section namespace.
     *
     * @example
     *     const meta = new Metadata("example.com/", { "%label": "value" })
     *
     * @param key The section key namespace
     * @param value Nested object containing key-value pairs
     */
    constructor(key: Metadata_Key_sDomain, value: MetaInputParts.Nested)

    /**
     * Constructs a Metadata instance from an input object or returns an empty Metadata if no input
     * provided.
     *
     * @example
     *     const meta = new Metadata({ "%app": "my-app", name: "resource" })
     *     const empty = new Metadata()
     *
     * @param input Object or map containing key-value pairs
     */
    constructor(input?: Metadata_Input)
    /**
     * Constructs a new Metadata instance from a map of key-value pairs. Validates all keys and
     * values during construction.
     *
     * @param _dict Internal map storing metadata key-value pairs
     * @throws {K8tsMetadataError} If any key or value is invalid
     */
    constructor(a?: any, b?: any) {
        this._dict = _pairToMap([a, b])
        for (const [key, value] of this._dict.entries()) {
            checkMetadataValue(key, value)
        }
    }

    /**
     * Makes Metadata instances iterable, yielding [ValueKey, string] pairs.
     *
     * @example
     *     for (const [key, value] of meta) {
     *         console.log(key.str, value)
     *     }
     */
    *[Symbol.iterator]() {
        for (const entry of this._dict.entries()) {
            yield entry
        }
    }

    /**
     * Creates a deep clone of this object.
     *
     * @returns
     */
    clone() {
        return new Metadata(this)
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
    delete(key: Metadata_Key_sValue): Metadata

    /**
     * Deletes specific keys under a domain prefix.
     *
     * @example
     *     meta.delete("example.com/", "key1", "key2") // deletes specific keys in section
     *
     * @param ns The section key namespace
     * @param keys Specific value keys within the section to delete
     */
    delete(ns: Metadata_Key_sDomain, keys: Metadata_Key_sValue[]): Metadata

    /**
     * Deletes all keys within a section namespace.
     *
     * @example
     *     meta.delete("example.com/") // deletes all keys in section
     *
     * @param ns The section key namespace to delete
     */
    delete(ns: Metadata_Key_sDomain): Metadata
    delete(a: any, ...rest: any[]) {
        if (a.endsWith("/")) {
            const sectionKey = parseSectionKey(a)
            const onlyKeys = rest.map(parseInnerKey)
            if (onlyKeys.length > 0) {
                var deleteOnly = (key: Metadata_Key_Value) => onlyKeys.some(ok => ok.equals(key))
            } else {
                var deleteOnly = (_key: Metadata_Key_Value) => _key.domain().equals(sectionKey)
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
    add(key: Metadata_Key_sValue, value?: string): Metadata

    /**
     * Adds a nested object of key-value pairs within a section namespace. Throws if any key already
     * exists.
     *
     * @example
     *     meta.add("example.com/", { "%label": "value", "^annotation": "data" })
     *
     * @param key The section key namespace
     * @param value Nested object containing key-value pairs
     */
    add<Domain extends NotPrefixed<Domain>>(key: Domain, value: MetaInputParts.Nested): Metadata

    /**
     * Adds multiple key-value pairs from an input object. Throws if any key already exists.
     *
     * @example
     *     meta.add({ "%app": "my-app", name: "my-resource" })
     *
     * @param input Object or map containing key-value pairs to add
     */
    add(input: Metadata_Input): Metadata
    add(a: any, b?: any) {
        const parsed = _pairToMap([a, b])
        for (const [k, v] of parsed) {
            if (this._dict.has(k)) {
                const prev = this._dict.get(k)
                throw new K8tsMetadataError(`Duplicate entry for ${k}, was ${prev} now ${v}`, {
                    key: (k as any).str
                })
            }
            this._dict.set(k, v)
        }
        return this
    }

    /**
     * Compares this Metadata instance to another for equality. Two instances are equal if they
     * contain the same key-value pairs.
     *
     * @param other The other Metadata instance or input to compare against
     * @returns Whether the two Metadata instances are equal
     */
    equals(other: Metadata_Input) {
        return equalsMap(this._dict, new Metadata(other)._dict)
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
    overwrite(key: Metadata_Key_sValue, value: string | undefined): Metadata

    /**
     * Overwrites key-value pairs within a section namespace.
     *
     * @example
     *     meta.overwrite("example.com/", { "%label": "new-value" })
     *
     * @param key The section key namespace
     * @param value Nested object containing key-value pairs to overwrite
     */
    overwrite<Domain extends NotPrefixed<Domain>>(
        key: Domain,
        value: MetaInputParts.Nested
    ): Metadata

    /**
     * Overwrites multiple key-value pairs from an input object.
     *
     * @example
     *     meta.overwrite({ "%app": "new-app", name: "new-name" })
     *
     * @param input Object or map containing key-value pairs to overwrite
     */
    overwrite(input?: Metadata_Input): Metadata
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
    has<Domain extends NotPrefixed<Domain>>(domainPrefix: Domain): boolean
    /** @param key */
    has(key: Metadata_Key_sValue): boolean
    has(key: any) {
        const parsed = parseKey(key)
        if (parsed instanceof Metadata_Key_Value) {
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
     * @throws {K8tsMetadataError} If the key is not found
     */
    get(key: Metadata_Key_sValue) {
        const parsed = parseKey(key)
        const v = this._dict.get(key)
        if (v === undefined) {
            throw new K8tsMetadataError(`Key ${key} not found!`, { key })
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
     * @throws {K8tsMetadataError} If a domain key is provided instead of a value key
     */
    tryGet(key: Metadata_Key_sValue, fallback?: string) {
        const parsed = parseKey(key)
        if (!(parsed instanceof Metadata_Key_Value)) {
            throw new K8tsMetadataError("Unexpected domain key!", { key })
        }
        return this._dict.get(key) ?? fallback
    }

    private get _parsedPairs() {
        return seq(this._dict)
            .map(([k, v]) => [parseKey(k) as Metadata_Key_Value, v] as const)
            .toArray()
            .pull()
    }

    private _matchDomainPrefixes(key: Metadata_Key_Domain) {
        return seq(this._parsedPairs)
            .filter(([k, v]) => k.parent?.equals(key) ?? false)
            .toMap(x => [x[0].str, x[1]] as const)
            .pull()
    }

    /**
     * Creates a new Metadata instance containing only some of the keys. You can pass both entire
     * keys and domain prefixes to include all keys under that domain.
     *
     * @example
     *     const subset = meta.pick("%app", "name", "example.com/")
     *
     * @param keySpecs Keys or domain prefixes to include in the result
     * @returns A new Metadata instance with only the picked keys
     */
    pick(...keySpecs: (Metadata_Key_sDomain | Metadata_Key_sValue)[]) {
        const parsed = keySpecs.map(parseKey)
        const keyStrSet = new Set<string>()
        for (const key of parsed) {
            if (key instanceof Metadata_Key_Value) {
                keyStrSet.add(key.str)
            } else {
                const sectionKeys = this._matchDomainPrefixes(key)
                for (const k of sectionKeys.keys()) {
                    keyStrSet.add(k)
                }
            }
        }
        const out = new Map<Metadata_Key_sValue, string>()
        for (const [k, v] of this._dict.entries()) {
            if (keyStrSet.has(k)) out.set(k as any, v)
        }
        return new Metadata(out)
    }

    private _prefixed(prefix: string) {
        const out: { [k: string]: string } = {}
        for (const [k, v] of this._parsedPairs) {
            if (k.prefix() === prefix) {
                out[k.suffix] = v
            }
        }
        return orderMetaKeyedObject(out)
    }

    /**
     * Returns all labels as a plain object that can be embedded into a k8s manifest, with keys in
     * canonical order.
     *
     * @example
     *     const labels = Metadata.make({
     *         "%app": "my-app",
     *         "%tier": "backend"
     *     }).labels
     *     // { app: "my-app", tier: "backend" }
     */
    get labels() {
        return this._prefixed("%")
    }

    /**
     * Returns all annotations as a plain object that can be embedded into a k8s manifest, with keys
     * in canonical order.
     *
     * @example
     *     const annotations = Metadata.make({
     *         "^note": "This is important",
     *         "^description": "Detailed info"
     *     }).annotations
     *     // { note: "This is important", description: "Detailed info" }
     */
    get annotations() {
        return this._prefixed("^")
    }

    /**
     * Returns all comments (build-time metadata) as a plain object, with keys in canonical order.
     *
     * @example
     *     const comments = Metadata.make({
     *         "#note": "Internal use only"
     *     }).comments
     *     // { note: "Internal use only" }
     */
    get comments() {
        return this._prefixed("#")
    }

    /**
     * Returns all metadata key-value pairs as a flat JavaScript object, with each key prefixed
     * appropriately.
     *
     * @example
     *     const all = Metadata.make({
     *         "%app": "my-app",
     *         "^note": "This is important",
     *         name: "my-resource"
     *     }).values
     *     // { "%app": "my-app", "^note": "This is important", "name": "my-resource" }
     */
    get record() {
        return toJS(this._dict)
    }

    private get _keys(): Metadata_Key_Value[] {
        return seq(this._parsedPairs)
            .map(([k, v]) => k)
            .toArray()
            .pull()
    }
}

function _pairToObject(pair: [string | Metadata_Key_Value, string | object] | [object]) {
    let [key, value] = pair
    key = key instanceof Metadata_Key_Value ? key.str : key
    if (typeof key === "string") {
        return {
            [key]: value as string
        }
    }
    return key
}
function _pairToMap(pair: [Metadata_Key_sValue, string | object] | [object]) {
    return parseMetaInput(_pairToObject(pair))
}
