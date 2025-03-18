import { Embedder } from "../_embedder/base"
import { Dependencies, dependencies, NeedsEdge } from "./dependencies"
import { ResourceEntity, ResourceNode } from "./resource-node"

export namespace Relations {
    export interface Out {
        needs: () => Iterable<NeedsEdge<ResourceNode>>
        parent: () => ResourceNode | null
        kids: () => ResourceNode[]
    }

    export type In<Target extends ResourceEntity = ResourceEntity> = {
        needs: (self: Target) => Dependencies.Input
        parent: (self: Target) => ResourceEntity | null
        kids: (self: Target) => ResourceEntity[]
    } & {
        [key: string]: (self: Target, ...args: any[]) => any
    }
}

class RelationsService {
    private _system = new Embedder<ResourceEntity, Relations.In>("relations")

    implement(
        ctor: abstract new (...args: any[]) => ResourceEntity,
        input: Relations.In<ResourceEntity>
    ) {
        const existing = this._system.tryGet(ctor.prototype)
        if (existing) {
            input = Object.assign({}, existing, input)
        }
        this._system.set(ctor.prototype, input)
    }

    get(target: ResourceEntity): Relations.Out {
        const input = this._system.get(target)
        const o = {
            kids: () => input.kids?.call(o, target).map(x => x.node) ?? [],
            parent: () => input.parent?.call(o, target)?.node ?? null,
            needs: () => dependencies(input.needs?.call(o, target) ?? {})
        }
        return o
    }

    get decorator() {
        return <
            Target extends abstract new (...args: any[]) => ResourceEntity,
            Impl extends Partial<Relations.In<InstanceType<Target>>> | "none"
        >(
            input: Impl
        ) => {
            return (ctor: Target) => {
                this.implement(ctor, input === "none" ? {} : (input as any))
                return ctor
            }
        }
    }
}
export const Relations = new RelationsService()
export const relations = Relations.decorator

// writing the decorator itself
