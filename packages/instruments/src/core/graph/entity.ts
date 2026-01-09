import { getNiceClassName, type AnyCtor } from "what-are-you"
import { K8tsGraphError } from "./error"
import type { Vertex } from "./node"
export type LiteralModes = "simple" | "pretty" | "prefix"

let globalEntityId = 0

export type EntityRef = {
    kind: any
    equals(other: any): boolean
    cast<Inst extends EntityRef>(cls: abstract new (...args: any[]) => Inst): Inst
}
export abstract class Entity<
    _Node extends Vertex<_Node, _Ent> = Vertex<any, any>,
    _Ent extends Entity<_Node, _Ent> = Entity<any, any>,
    _EntRefType extends EntityRef = EntityRef
> implements EntityRef
{
    protected __kids__(): Iterable<_EntRefType> {
        return []
    }
    abstract readonly kind: any

    abstract get __vertex__(): _Node

    cast<Inst extends _EntRefType>(cls: AnyCtor<Inst>): Inst {
        if (this instanceof cls) {
            return this as any as Inst
        }
        throw new K8tsGraphError(
            `This Resource ${this} is not compatible with the class ${getNiceClassName(cls)}.`
        )
    }

    abstract equals(other: any): boolean

    protected get __parent__(): _EntRefType | undefined {
        return undefined
    }

    protected __needs__(): Record<string, _EntRefType | undefined | _EntRefType[]> {
        return {}
    }
}

export type Formats = "local" | "source" | undefined
