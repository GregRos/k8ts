import { getNiceClassName, type AnyCtor } from "what-are-you"
import { K8tsGraphError } from "./error"
import type { Vertex } from "./node"
export type LiteralModes = "simple" | "pretty" | "prefix"

let globalEntityId = 0

export type RefLike = {
    kind: any
    name: string
    asAssert<Inst extends RefLike>(cls: abstract new (...args: any[]) => Inst): Inst
    is<Inst extends RefLike>(cls: abstract new (...args: any[]) => Inst): this is Inst
}
export abstract class Entity<
    _Node extends Vertex<_Node, _Ent> = Vertex<any, any>,
    _Ent extends Entity<_Node, _Ent> = Entity<any, any>,
    _EntRefType extends RefLike = RefLike
> {
    private readonly _ownKids: _EntRefType[] = []

    protected __attach_kid__(kid: _EntRefType) {
        this._ownKids.push(kid)
    }

    protected __kids__(): Iterable<_EntRefType> {
        return this._ownKids
    }
    abstract readonly kind: any
    private readonly _ID = (() => {
        return globalEntityId++
    })()
    abstract readonly vertex: _Node
    abstract readonly name: string
    asAssert<Inst extends _EntRefType>(cls: AnyCtor<Inst>): Inst {
        if (this.is(cls)) {
            return this as any as Inst
        }
        throw new K8tsGraphError(
            `This Resource ${this} is not compatible with the class ${getNiceClassName(cls)}.`
        )
    }
    is<K extends this["kind"]>(kind: K): this is { kind: K }
    is<Inst extends _EntRefType = _EntRefType>(
        cls: abstract new (...args: any[]) => Inst
    ): this is Inst
    is(cls: any): boolean {
        if (typeof cls === "function") {
            return this instanceof cls
        }
        return this.kind.equals(cls)
    }
    abstract equals(other: any): boolean

    protected __parent__(): _EntRefType | undefined {
        return undefined
    }

    protected __needs__(): Record<string, _EntRefType | undefined | _EntRefType[]> {
        return {}
    }
}

export type Formats = "local" | "source" | undefined
