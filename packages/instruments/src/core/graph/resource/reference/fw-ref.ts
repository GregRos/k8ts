import type { Doddle } from "doddle"
import type { AnyCtor } from "what-are-you"
import { RefKey } from "../ref-key"
import { ProxyOperationError } from "./error"
import type { Rsc_Ref } from "./refable"

/**
 * The type of a forward reference to a resource.
 *
 * Acts as a stand-in for a resource that may not yet be available. Can be used to reference
 * resources across different Origins while deferring their actual resolution until needed. This
 * allows for circular references and more flexible resource definitions.
 *
 * The base `FwRef` object only has some basic properties about the resource being referenced, such
 * as its {@link RefKey} and class type. Accessing any other properties or methods on the `FwRef`
 * will trigger the resolution of the actual resource via a resolver.
 *
 * Because the `FwRef` avoids resolving the actual resource until needed, it won't detect missing
 * resources when the reference is created. Instead, the missing resource will be detected later on,
 * typically until resources are manifested. This makes it a bit harder to debug such issues.
 */
export type FwRef<T extends Rsc_Ref = Rsc_Ref> = FwRef_Proxied<T> & T

/**
 * Creates a forward reference to a resource, returning a proxy that defers resource resolution
 * until properties or methods are accessed.
 *
 * @param props The properties of the forward reference.
 * @returns The forward reference proxy.
 */
export function FwRef<Referenced extends Rsc_Ref>(
    props: FwRef_Props<Referenced>
): FwRef<Referenced> {
    const core = new FwRef_Proxied(props)
    return new Proxy(core, new FwRef_Handler(core)) as FwRef<Referenced>
}
export namespace FwRef {
    export function is(obj: any): obj is FwRef {
        return FwRef_Proxied.is(obj)
    }
}
/** Properties for creating a forward reference to a resource. */
export interface FwRef_Props<Referenced extends Rsc_Ref> {
    /** The class constructor of the referenced resource. */
    readonly class?: AnyCtor<Referenced>
    /** The reference key identifying the referenced resource. */
    readonly key: RefKey
    readonly origin: object
    readonly resolver: Doddle<Referenced>
}

class FwRef_Proxied<To extends Rsc_Ref> {
    readonly #props: FwRef_Props<To>
    constructor(props: FwRef_Props<To>) {
        this.#props = props
    }

    get name() {
        return this.#props.key.name
    }

    get namespace() {
        return this.#props.key.namespace
    }

    get kind() {
        return this.#props.key.kind
    }

    static is(obj: any): obj is FwRef {
        return obj && typeof obj === "object" && "__reference_props__" in obj
    }

    protected __pull__() {
        return this.#props.resolver.pull()
    }

    protected __reference_props__() {
        return this.#props
    }

    get key() {
        return new RefKey(this.kind, {
            name: this.name,
            namespace: this.namespace
        })
    }

    equals(other: any): boolean {
        if (!other) {
            return false
        }
        // Resource_Top has a key property, but Resource_Child doesn't
        // However in that case, the kind will be different anyway
        // since FwRefs are just for top resources.
        return this.key.equals(other.key)
    }
}

class FwRef_Handler<T extends Rsc_Ref> implements ProxyHandler<T> {
    get _props() {
        return this._subject["__reference_props__"]()
    }
    constructor(private readonly _subject: FwRef_Proxied<T>) {}

    get(target: T, prop: PropertyKey) {
        const { _props, _subject } = this
        if (prop === "constructor") {
            return this._props.class
        }
        if (Reflect.has(_subject, prop)) {
            return Reflect.get(_subject, prop)
        }
        const resource = _subject["__pull__"]() as any
        const result = Reflect.get(resource, prop)
        if (typeof result === "function") {
            return result.bind(resource)
        }
        return result
    }
    getPrototypeOf(target: T) {
        const Resource_Top = require("../top").Resource_Top
        return this._props.class?.prototype ?? Resource_Top.prototype
    }
    has(target: T, prop: PropertyKey) {
        const { _props, _subject } = this
        if (Reflect.has(_subject, prop)) {
            return true
        }
        const resource = _props.resolver.pull() as any
        return Reflect.has(resource, prop)
    }
    getOwnPropertyDescriptor(_: T, p: string | symbol): PropertyDescriptor | undefined {
        const { _subject, _props } = this
        const desc = Object.getOwnPropertyDescriptor(_subject, p)
        if (desc) {
            desc.configurable = false
            return desc
        }
        const resource = _props.resolver.pull() as any
        const resourceDesc = Object.getOwnPropertyDescriptor(resource, p)
        return resourceDesc
    }
    get referant() {
        return this._subject["__reference_props__"]().key.string
    }
    #createImmutableError(action: string) {
        return new ProxyOperationError(
            `Tried to ${action} a forward reference to ${this.referant}, but it cannot be modified.`
        )
    }

    defineProperty(_: any, property: string | symbol, desc: PropertyDescriptor): boolean {
        throw this.#createImmutableError(`define property ${String(property)} on`)
    }
    deleteProperty(_: T, p: string | symbol): boolean {
        throw this.#createImmutableError(`delete property ${String(p)} from`)
    }
    preventExtensions(): boolean {
        return true
    }
    isExtensible(): boolean {
        return false
    }
    set(_: T, p: string | symbol): boolean {
        throw this.#createImmutableError(`set property ${String(p)} on`)
    }
    ownKeys(): ArrayLike<string | symbol> {
        const pulled = this._props.resolver.pull() as any
        return [...Reflect.ownKeys(this._subject), ...Reflect.ownKeys(pulled)]
    }
    setPrototypeOf(): boolean {
        throw this.#createImmutableError(`set the prototype of`)
    }
}
