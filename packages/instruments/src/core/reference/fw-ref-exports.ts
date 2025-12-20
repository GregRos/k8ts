import { seq } from "doddle"
import type { LiveRefable } from "."
import { FwReference } from "."
import { ProxyOperationError } from "../../error"
import type { ResourceEntity } from "../entities"
import { type OriginEntity } from "../entities/origin/origin-entity"

export type FwRef_Exports_ByKey<Exports extends LiveRefable = LiveRefable> = {
    [E in Exports as `${E["kind"]["name"]}/${E["name"]}`]: FwReference<E>
}

export type FwRef_Exports<Actual extends OriginEntity, Exported extends LiveRefable> = Actual &
    FwRef_Exports_ByKey<Exported>

export function FwRef_Exports<Actual extends OriginEntity, Exported extends LiveRefable>(
    props: FwRef_Exports_Props<Actual, Exported>
): FwRef_Exports<Actual, Exported> {
    const handler = new FwRef_Exports_Handler(props)
    return new Proxy(props.entity, handler) as any
}
export interface FwRef_Exports_Props<
    Actual extends OriginEntity = OriginEntity,
    Exports extends LiveRefable = LiveRefable
> {
    readonly entity: Actual
    readonly exports: Iterable<Exports>
}

class FwRef_Exports_Handler<Entity extends OriginEntity> implements ProxyHandler<Entity> {
    constructor(private readonly _props: FwRef_Exports_Props) {}

    get entity() {
        return this._props.entity
    }
    get node() {
        return this._props.entity.node
    }
    get resourceKinds() {
        return this.node.resourceKinds
    }

    #createImmutableError(action: string) {
        return new ProxyOperationError(
            `Tried to ${action} an the exports constructs of ${this._props}, but it is immutable.`
        )
    }

    defineProperty(_: object, property: string | symbol, __: PropertyDescriptor): boolean {
        throw this.#createImmutableError(`define property ${String(property)} on`)
    }

    deleteProperty(_: object, property: string | symbol): boolean {
        throw this.#createImmutableError(`delete property ${String(property)} from`)
    }

    getPrototypeOf(_: Entity): object | null {
        return Reflect.getPrototypeOf(this.entity)
    }

    get exported() {
        return seq(this._props.exports)
    }

    #isValidReferant(prop: PropertyKey) {
        return this.resourceKinds.tryParse(prop as string) != null
    }

    get(target: any, property: string | symbol): any {
        const key = property as string
        if (Reflect.has(this.entity, key)) {
            const x = Reflect.get(this.entity, property)
            if (typeof x === "function") {
                return x.bind(this.entity)
            }
            return x
        }

        const resourceKinds = this.resourceKinds
        const refKey = resourceKinds.tryParse(key)
        const clazz = resourceKinds.tryGetClass(key)
        if (refKey == null) {
            return undefined
        }
        return FwReference({
            class: clazz,
            key: refKey,
            origin: this._props.entity,
            namespace: this._props.entity.meta.tryGet("namespace"),
            resolver: this.exported
                .as<ResourceEntity>()
                .first(exp => exp.node.key.equals(refKey))
                .map(x => {
                    if (x == null) {
                        throw new ProxyOperationError(
                            `Failed to resolve forward reference to ${refKey} in ${this._props.entity}.`
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
            `Cannot list all keys of a dynamic exports construct for ${this._props.entity}.`
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
