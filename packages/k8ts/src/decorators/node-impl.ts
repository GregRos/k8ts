import { ResourceNodeImpl } from "@k8ts/instruments"
import { META_MixinImplInput } from "@k8ts/instruments/src/_traits/object-impl"
import { MakeError } from "../error"
import { ManifestResource } from "../node"
import { AbsResource } from "../node/abs-resource"
import { dependencies } from "../node/dependencies"

class ResourceNodeImplWrapper implements ResourceNodeImpl {
    constructor(
        private readonly impl: ResourceNodeInput,
        private readonly _self: AbsResource
    ) {}

    parent() {
        return this.impl.parent?.call(this._self, this._self)?.node ?? null
    }

    kids() {
        return this.impl.kids?.call(this._self, this._self).map(it => it.node) ?? []
    }

    needs() {
        return dependencies(this.impl.needs?.call(this._self, this._self) ?? {})
    }
}
export namespace ResourceImplManager {
    type HavingImplSymbol<X extends AbsResource> = X & {
        [IMPL]: Input<X>
    }
    const IMPL = Symbol.for("k8ts.build.org/node/impl")
    export type TypeInputs = {
        parent: AbsResource | null
        kids: AbsResource[]
        needs: Record<string, ManifestResource>
    }
    export type Input<S> = META_MixinImplInput<TypeInputs, S>

    export function get(self: AbsResource): ResourceNodeImpl {
        if (!has(self)) {
            throw new MakeError(
                `Resource ${self.shortFqn} doesn't have the implementsNode decorator!`
            )
        }
        return new ResourceNodeImplWrapper(self[IMPL], self)
    }

    export function set(prototype: AbsResource, impl: Input<AbsResource>) {
        Object.defineProperty(prototype, IMPL, {
            enumerable: false,
            value: impl,
            writable: true,
            configurable: true
        })
    }

    export function has<T extends AbsResource>(self: T): self is HavingImplSymbol<T> {
        return IMPL in self
    }

    export function implement<F extends { new (...args: any[]): AbsResource }>(
        thing: ResourceImplManager.Input<InstanceType<F>>
    ) {
        return (ctor: F) => {
            ResourceImplManager.set(ctor.prototype, thing as any)
            return ctor
        }
    }
}
export const connections = ResourceImplManager.implement
