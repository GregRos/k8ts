import { InstrumentsError } from "../../../../error"
import type { Kind } from "../api-kind"
import { type External_Props, type External_WithFeatures } from "../external"
import type { Ref2_Of } from "../reference"

/** Input type for reference keys. Accepts either a RefKey instance or its string representation. */
export type RefKey_Input = RefKey | RefKey["string"]

/**
 * String format template for reference keys.
 *
 * @template Kind - The Kubernetes resource kind
 * @template Name - The resource name
 */
export type RefKey_sFormat<Kind extends string, Name extends string> = `${Kind}/${Name}`

const separator = "/"

/** Parsed representation of a reference key string. */
export interface RefKey_Parsed {
    /** The Kubernetes resource kind */
    kind: string
    /** The resource name */
    name: string
}

export function parse(ref: string) {
    const result = tryParse(ref)
    if (!result) {
        throw new InstrumentsError(`Could not parse reference key: ${ref}`)
    }
    return result
}

/**
 * Attempts to parse a reference key string into its kind and name components. Returns undefined if
 * the string cannot be parsed.
 *
 * @param ref - The reference key string to parse (format: "Kind/Name")
 * @returns The parsed reference key, or undefined if parsing fails
 */
export function tryParse(ref: string): RefKey_Parsed | undefined {
    if (typeof ref !== "string") {
        return undefined
    }
    if (ref == null) {
        return undefined
    }
    if (typeof ref === "object") {
        return undefined
    }
    const [kind, name] = ref.split(separator).map(s => s.trim())
    if (!kind || !name) {
        return undefined
    }
    return {
        kind,
        name
    }
}

type nsKind = Kind<"", "v1", "Namespace">

/**
 * Options for creating a RefKey instance.
 *
 * @template Name - The resource name type
 */
export interface RefKey_Options<Name extends string = string> {
    /** The resource name */
    name: Name
    /** Optional namespace for namespaced resources. Can be a RefKey, string, or Ref2 */
    namespace?: RefKey<nsKind> | string | Ref2_Of<nsKind>
}

/**
 * A unique identifier for a k8s resource consisting of a Kind, name, and namespace. Used by
 * resources to reference other resources. Serves as the basis for the {@link External} resource
 * type.
 */
export class RefKey<K extends Kind.KindLike = Kind.KindLike, Name extends string = string> {
    /** The resource name */
    readonly name: string
    /** The optional namespace for namespaced resources */
    readonly namespace: string | undefined

    /**
     * Creates a new RefKey instance.
     *
     * @param kind - The Kubernetes resource kind
     * @param options - Configuration options including name and optional namespace
     */
    constructor(
        readonly kind: K,
        options: RefKey_Options<Name>
    ) {
        this.name = options.name
        this.namespace =
            typeof options.namespace === "string" ? options.namespace : options.namespace?.name
    }

    /**
     * Returns the string representation of this reference key. Format: "Kind/Namespace/Name" or
     * "Kind/Name" for cluster-scoped resources.
     */
    get string(): RefKey_sFormat<K["name"], Name> {
        return [this.kind.name, this.namespace, this.name]
            .filter(x => !!x)
            .join(separator) as RefKey_sFormat<K["name"], Name>
    }

    /**
     * Checks if this RefKey is equal to another RefKey by comparing kind, name, and namespace.
     *
     * @param other - The RefKey to compare with
     * @returns True if both RefKeys have the same kind, name, and namespace
     */
    equals(other: RefKey): boolean {
        if (other == null) {
            return false
        }
        if (typeof other !== "object") {
            return false
        }
        return (
            this.kind.equals(other.kind) &&
            this.name === other.name &&
            this.namespace === other.namespace
        )
    }

    /**
     * Returns the string representation of this reference key.
     *
     * @returns The reference key in string format
     */
    toString() {
        return this.string
    }

    /**
     * Creates an External reference to this resource.
     *
     * @template P - The external properties type
     * @param options - Optional external properties configuration
     * @returns An External instance with the specified features
     */
    External<const P extends External_Props<K> = External_Props<K>>(
        options?: P
    ): External_WithFeatures<K, P> {
        const External = require("../external").External

        return new External(this, options ?? {}) as any
    }
}
