import { seq } from "doddle"
import { OriginEntity } from "../../origin"
import type { OriginExporter } from "../../origin/exporter"
import { RefKey } from "../ref-key"
import { ProxyOperationError } from "./error"
import { FwRef } from "./fw-ref"
import type { ResourceRef } from "./refable"

/** Expands the resources exported by an OriginExported into a dictionary of name to FwRef. */
export type FwRef_Exports_ByKey<Exports extends ResourceRef = ResourceRef> = {
    [E in Exports as `${E["ident"]["name"]}/${E["name"]}`]: FwRef<E>
}
/**
 * A type describing all resources exported by an {@link OriginExporter} as forward references.
 *
 * FwRefs can be accessed using a key lookup, using the shorthand of `KindName/name`. For example, a
 * Deployment named "my-app" can be accessed via `exports["Deployment/my-app"]`.
 *
 * This construct is immutable; attempts to modify it will will throw errors.
 *
 * The underlying entity can be accessed via the `__entity__()` method.
 *
 * During TypeScript compilation, this serves as a type-safe way to reference resources between
 * entities. During runtime, it provides a dynamic proxy that resolves forward references to the
 * actual resources when accessed.
 *
 * During runtime, this construct can provide references to all resources attached to the Origin,
 * even if they were not explicitly exported.
 */
export type ForwardExports<Exported extends ResourceRef = any> = RscFwRef_Exports_Proxied &
    FwRef_Exports_ByKey<Exported>

/**
 * Creates a forward reference exports construct for the given {@link OriginExporter} entity.
 *
 * @param entity
 * @returns
 */
export function ForwardExports<Exported extends ResourceRef>(
    entity: OriginExporter
): ForwardExports<Exported> {
    const proxied = new RscFwRef_Exports_Proxied(entity)
    const handler = new FwRef_Exports_Handler(proxied)
    return new Proxy(proxied, handler) as any
}
export namespace ForwardExports {
    export function is(obj: any): obj is ForwardExports {
        return obj instanceof RscFwRef_Exports_Proxied
    }
}

/**
 * A basic core of the {@link ForwardExports} construct, containing information about the underlying
 * {@link OriginExporter} entity.
 */
export class RscFwRef_Exports_Proxied {
    #entity: OriginExporter
    constructor(entity: OriginExporter) {
        this.#entity = entity
    }

    __entity__(act?: (entity: OriginExporter) => any): OriginExporter {
        return this.#entity as any
    }

    equals(other: any): boolean {
        if (!other) {
            return false
        }
        if (ForwardExports.is(other)) {
            return this.#entity.equals(other.#entity)
        }
        if (other instanceof OriginEntity) {
            return other.equals(this.#entity)
        }
        return false
    }
}

/**
 * Proxy handler for the {@link ForwardExports} construct, providing dynamic access to the resources
 * attached to the underlying {@link OriginExporter} entity.
 */
class FwRef_Exports_Handler<Entity extends OriginExporter> implements ProxyHandler<Entity> {
    constructor(private readonly _subject: RscFwRef_Exports_Proxied) {}

    get entity() {
        return this._subject["__entity__"]()
    }
    get node() {
        return this.entity.node
    }
    get resourceKinds() {
        return this.node.resourceKinds
    }

    #createImmutableError(action: string) {
        return new ProxyOperationError(
            `Tried to ${action} an the exports constructs of ${this.entity}, but it is immutable.`
        )
    }

    defineProperty(_: object, property: string | symbol, __: PropertyDescriptor): boolean {
        throw this.#createImmutableError(`define property ${String(property)} on`)
    }

    deleteProperty(_: object, property: string | symbol): boolean {
        throw this.#createImmutableError(`delete property ${String(property)} from`)
    }

    getPrototypeOf(_: Entity): object | null {
        return RscFwRef_Exports_Proxied.prototype
    }

    get exported() {
        return seq(this.entity.resources)
    }

    #isValidReferant(prop: PropertyKey) {
        return this.resourceKinds.tryParse(prop as string) != null
    }

    get(target: any, property: string | symbol): any {
        const key = property as string
        if (key === "constructor") {
            return this._subject.__entity__().constructor
        }
        if (Reflect.has(this._subject, key)) {
            const x = Reflect.get(this._subject, property)
            if (typeof x === "function") {
                return x.bind(this._subject)
            }
            return x
        }

        const resourceKinds = this.resourceKinds
        const refKey = resourceKinds.tryParse(key)
        const clazz = resourceKinds.tryGetClass(key)
        if (refKey == null) {
            return undefined
        }
        return FwRef({
            class: clazz,
            key: new RefKey(refKey.kind, {
                name: refKey.name
            }),
            origin: this.entity,
            resolver: this.exported
                .first(exp => exp.node.name === refKey.name && exp.node.ident.equals(refKey.kind))
                .map(x => {
                    if (x == null) {
                        throw new ProxyOperationError(
                            `Failed to resolve forward reference to ${refKey} in ${this.entity}.`
                        )
                    }
                    return x
                })
        })
    }

    has(_: Entity, p: string | symbol): boolean {
        if (Reflect.has(this.entity, p)) {
            return true
        }
        if (!this.#isValidReferant(p)) {
            return false
        }
        return true
    }

    isExtensible(target: Entity): boolean {
        return false
    }

    preventExtensions(target: Entity): boolean {
        return true
    }

    ownKeys(target: Entity): ArrayLike<string | symbol> {
        throw new ProxyOperationError(
            `Cannot list all keys of a dynamic exports construct for ${this.entity}.`
        )
    }

    set(target: Entity, p: string | symbol, newValue: any, receiver: any): boolean {
        throw this.#createImmutableError(`set property ${String(p)} on`)
    }

    setPrototypeOf(target: Entity, v: any): boolean {
        throw this.#createImmutableError(`set prototype of`)
    }

    _tryTargetDescriptor(p: PropertyKey) {
        return Object.getOwnPropertyDescriptor(this.entity, p)
    }

    getOwnPropertyDescriptor(target: Entity, p: string | symbol): PropertyDescriptor | undefined {
        const desc = this._tryTargetDescriptor(p)
        if (desc) {
            return desc
        }
        const value = this.get(this.entity, p)
        if (value == null) {
            return undefined
        }
        return {
            configurable: false,
            enumerable: true,
            value,
            writable: false
        }
    }
}
