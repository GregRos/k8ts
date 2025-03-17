import { Dependencies, dependencies, NeedsEdge } from "../graph/dependencies"
import { ResourceEntity, ResourceNode } from "../graph/resource-node"
import { Embedder } from "./base"

export namespace Connections {
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

export class ConnectionsDecorator {
    private _system = new Embedder<ResourceEntity, Connections.In>("connections")

    implement(
        ctor: abstract new (...args: any[]) => ResourceEntity,
        input: Connections.In<ResourceEntity>
    ) {
        this._system.set(ctor.prototype, input)
    }

    get(target: ResourceEntity): Connections.Out {
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
            Impl extends Partial<Connections.In<InstanceType<Target>>> | "none"
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
export const __CONNECTIONS = new ConnectionsDecorator()
export const connections = __CONNECTIONS.decorator

// writing the decorator itself
