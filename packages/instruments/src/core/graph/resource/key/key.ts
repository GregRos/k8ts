import type { GVK, GVK_Base } from "../api-kind"
import type { DummyResource } from "../dummy"
import type { ResourceRef, ResourceRef_Constructor_For } from "../ref"
import type { ResourceKey_sFormat } from "./parsing"

export const separator = "/"

/** Parsed representation of a reference key string. */
export interface ResourceKey_Parsed {
    /** The Kubernetes resource kind */
    kind: string
    /** The resource name */
    name: string
}

type nsKind = GVK<"v1/Namespace">

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

export interface ResourceKey_Like {
    readonly kind: GVK_Base
    readonly name: string
    readonly namespace: string | undefined
}

/**
 * A unique identifier for a k8s resource consisting of a Kind, name, and namespace. Used by
 * resources to reference other resources. Serves as the basis for the {@link DummyResource} resource
 * type.
 *
 * Important: This class is ambiguous because it can represent keys for namespaced resources but
 * ignore the namespace. Needs some kind of refactor.
 */
export class ResourceKey<K extends GVK_Base = GVK_Base, Name extends string = string> {
    /** The resource name */
    name: string
    /** The optional namespace for namespaced resources */
    namespace: string | undefined

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
        if (typeof options.namespace === "string") {
            this.namespace = options.namespace
        } else if (options.namespace && "ident" in options.namespace) {
            this.namespace = options.namespace.ident.name
        } else if (options.namespace) {
            this.namespace = options.namespace.name
        } else {
            this.namespace = undefined
        }
    }

    rename<NewName extends string>(newName: NewName) {
        return new ResourceKey<K, NewName>(this.kind, {
            name: newName,
            namespace: this.namespace
        })
    }

    /**
     * Returns the string representation of this reference key. Format: "Kind/Namespace/Name" or
     * "Kind/Name" for cluster-scoped resources.
     */
    get string(): ResourceKey_sFormat<K["value"], Name> {
        return [this.kind.value, this.namespace, this.name]
            .filter(x => !!x)
            .join(separator) as ResourceKey_sFormat<K["value"], Name>
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
        const DummyResource: ResourceRef_Constructor_For<DummyResource<K>> =
            require("../dummy").DummyResource
        const self = this

        const className = `${this.kind.value}DummyResource`
        const cls = {
            [className]: class extends DummyResource {
                get kind() {
                    return self.kind
                }
            }
        }[className]
        return new cls(this.name, this.namespace, {}) as DummyResource<K>
    }
}
