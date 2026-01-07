import { seq, type Doddle } from "doddle"
import { mapValues } from "lodash"
import { getNiceClassName } from "what-are-you"
import { K8tsGraphError } from "../../error"
import { ResourceKey } from "../key"
import type { ResourceRef, ResourceRef_Constructor_For } from "../ref"
import { K8tsProxyError } from "./error"

/**
 * The type of a forward reference to a resource.
 *
 * Acts as a stand-in for a resource that may not yet be available. Can be used to reference
 * resources across different Origins while deferring their actual resolution until needed. This
 * allows for circular references and more flexible resource definitions.
 *
 * The base `FwRef` object only has some basic properties about the resource being referenced, such
 * as its {@link ResourceKey} and class type. Accessing any other properties or methods on the
 * `FwRef` will trigger the resolution of the actual resource via a resolver.
 *
 * Because the `FwRef` avoids resolving the actual resource until needed, it won't detect missing
 * resources when the reference is created. Instead, the missing resource will be detected later on,
 * typically until resources are manifested. This makes it a bit harder to debug such issues.
 */
export type ForwardRef<T extends ResourceRef = ResourceRef> = ForwardRef_Proxied<T> & T

/**
 * Creates a forward reference to a resource, returning a proxy that defers resource resolution
 * until properties or methods are accessed.
 *
 * @param props The properties of the forward reference.
 * @returns The forward reference proxy.
 */
export function ForwardRef<Referenced extends ResourceRef>(
    props: ForwardRef_Props<Referenced>
): ForwardRef<Referenced> {
    const core = new ForwardRef_Proxied(props)
    return new Proxy(core, new ForwardRef_ProxyHandler(core)) as ForwardRef<Referenced>
}
export namespace ForwardRef {
    export function is(obj: any): obj is ForwardRef {
        return ForwardRef_Proxied.is(obj)
    }
}
/** Properties for creating a forward reference to a resource. */
export interface ForwardRef_Props<Referenced extends ResourceRef> {
    /** The class constructor of the referenced resource. */
    readonly class?: ResourceRef_Constructor_For<Referenced>
    /** The reference key identifying the referenced resource. */
    readonly key: ResourceKey
    readonly origin: object
    readonly resolver: Doddle<Referenced>
}
const hiddenProperties = {
    is(this: ForwardRef_Proxied, clsOrKind: any): boolean {
        if (typeof clsOrKind === "function") {
            return this.clazz.prototype instanceof clsOrKind || this instanceof clsOrKind
        }
        return this.kind.equals(clsOrKind)
    },
    assert(this: ForwardRef_Proxied, cls: abstract new (...args: any[]) => any): any {
        if (hiddenProperties.is.call(this, cls)) {
            return this as any
        }
        throw new K8tsGraphError(
            `This Resource ${this} is not compatible with the class ${getNiceClassName(cls)}.`
        )
    }
}
class ForwardRef_Proxied<To extends ResourceRef = ResourceRef> {
    readonly #props: ForwardRef_Props<To>
    constructor(props: ForwardRef_Props<To>) {
        this.#props = props
        Object.defineProperties(
            this,
            mapValues(hiddenProperties, prop => ({ value: prop }))
        )
    }

    get name() {
        return this.#props.key.name
    }

    get clazz() {
        return (
            this.#props.class ?? (require("../top").ResourceTop as ResourceRef_Constructor_For<To>)
        )
    }

    get namespace() {
        return this.__pull__().key.namespace // The $props.key won't have a namespace
    }

    get kind() {
        return this.#props.key.kind
    }

    static is(obj: any): obj is ForwardRef {
        return obj && typeof obj === "object" && "__reference_props__" in obj
    }

    protected __pull__() {
        return this.#props.resolver.pull()
    }

    protected __reference_props__() {
        return this.#props
    }

    get key() {
        return new ResourceKey(this.kind, {
            name: this.name,
            namespace: this.namespace
        })
    }

    equals(other: any): boolean {
        if (!other) {
            return false
        }
        // ResourceTop has a key property, but ResourceChild doesn't
        // However in that case, the kind will be different anyway
        // since FwRefs are just for top resources.
        return this.key.equals(other.key)
    }
}

class ForwardRef_ProxyHandler<T extends ResourceRef> implements ProxyHandler<T> {
    get _props() {
        return this._subject["__reference_props__"]()
    }
    constructor(private readonly _subject: ForwardRef_Proxied<T>) {}

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
        const RscTop = require("../top").ResourceTop
        return this._props.class?.prototype ?? RscTop.prototype
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
        return new K8tsProxyError(
            `Tried to ${action} a forward reference to ${this.referant}, but it cannot be modified.`
        )
    }

    defineProperty(_: any, property: string | symbol, desc: PropertyDescriptor): boolean {
        const pulled = this._props.resolver.pull() as any
        return Reflect.defineProperty(pulled, property, desc)
    }
    deleteProperty(_: T, p: string | symbol): boolean {
        const pulled = this._props.resolver.pull() as any
        return Reflect.deleteProperty(pulled, p)
    }
    preventExtensions(): boolean {
        return true
    }
    isExtensible(): boolean {
        return false
    }
    set(_: T, p: string | symbol): boolean {
        const pulled = this._props.resolver.pull() as any
        return Reflect.set(pulled, p, (_ as any)[p])
    }
    ownKeys(): ArrayLike<string | symbol> {
        const pulled = this._props.resolver.pull() as any
        const keys1 = Reflect.ownKeys(this._subject)
        const keys2 = Reflect.ownKeys(pulled)
        const uniq = seq(keys1).concat(keys2).uniq().toArray()
        return uniq.pull()
    }
    setPrototypeOf(): boolean {
        const pulled = this._props.resolver.pull() as any
        return Reflect.setPrototypeOf(pulled, pulled)
    }
}
