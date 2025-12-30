import { getNiceClassName, type AnyCtor } from "what-are-you"
import type { Node } from "./node"
export type LiteralModes = "simple" | "pretty" | "prefix"

let globalEntityId = 0

type AbsCtor<T> = abstract new (...args: any[]) => any
export type RefLike = {
    get ref(): {
        kind: string
        name: string
        namespace?: string
    }
    kind: any
    name: string
    assert<Inst extends RefLike>(cls: abstract new (...args: any[]) => Inst): Inst
    is<Inst extends RefLike>(cls: abstract new (...args: any[]) => Inst): this is Inst
}
export abstract class Entity<
    _Node extends Node<_Node, _Ent> = Node<any, any>,
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
    abstract get ref(): RefLike["ref"]
    abstract readonly kind: any
    private readonly _ID = (() => {
        return globalEntityId++
    })()
    abstract readonly node: _Node
    abstract readonly name: string
    assert<Inst extends _EntRefType>(cls: AnyCtor<Inst>): Inst {
        if (this.is(cls)) {
            return this as any as Inst
        }
        throw new Error(
            `This Resource ${this} is not compatible with the class ${getNiceClassName(cls)}.`
        )
    }
    is<K extends this["kind"]>(kind: K): this is { kind: K }
    is<Inst extends _EntRefType = _EntRefType>(cls: AnyCtor<Inst>): this is Inst
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
