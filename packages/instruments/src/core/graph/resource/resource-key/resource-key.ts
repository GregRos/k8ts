import type { IdentKind } from "../api-kind"
import type { DummyResource } from "../dummy"
import type { ResourceRef } from "../resource-ref"
import type { ResourceKey_sFormat } from "./parsing"

export const separator = "/"

/** Parsed representation of a reference key string. */
export interface ResourceKey_Parsed {
    /** The Kubernetes resource kind */
    kind: string
    /** The resource name */
    name: string
}

type nsKind = IdentKind<"", "v1", "Namespace">

/**
 * Options for creating a RefKey instance.
 *
 * @template Name - The resource name type
 */
export interface ResourceKey_Options<Name extends string = string> {
    /** The resource name */
    name: Name
    /** Optional namespace for namespaced resources. Can be a RefKey, string, or Ref2 */
    namespace?: ResourceKey<nsKind> | string | ResourceRef<nsKind>
}

/**
 * A unique identifier for a k8s resource consisting of a Kind, name, and namespace. Used by
 * resources to reference other resources. Serves as the basis for the {@link DummyResource} resource
 * type.
 *
 * Important: This class is ambiguous because it can represent keys for namespaced resources but
 * ignore the namespace. Needs some kind of refactor.
 */
export class ResourceKey<K extends IdentKind = IdentKind, Name extends string = string> {
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
        options: ResourceKey_Options<Name>
    ) {
        this.name = options.name
        this.namespace =
            typeof options.namespace === "string" ? options.namespace : options.namespace?.name
    }

    /**
     * Returns the string representation of this reference key. Format: "Kind/Namespace/Name" or
     * "Kind/Name" for cluster-scoped resources.
     */
    get string(): ResourceKey_sFormat<K["name"], Name> {
        return [this.kind.name, this.namespace, this.name]
            .filter(x => !!x)
            .join(separator) as ResourceKey_sFormat<K["name"], Name>
    }

    /**
     * Checks if this RefKey is equal to another RefKey by comparing kind, name, and namespace.
     *
     * @param other - The RefKey to compare with
     * @returns True if both RefKeys have the same kind, name, and namespace
     */
    equals(other: ResourceKey): boolean {
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
    DummyResource(): DummyResource<K> {
        const DummyResource = require("../dummy").DummyResource

        return new DummyResource(this) as any
    }
}
