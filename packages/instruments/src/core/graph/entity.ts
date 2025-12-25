import type { Node } from "./node"
import { FwRef } from "./resource"
export type LiteralModes = "simple" | "pretty" | "prefix"

let globalEntityId = 0
export abstract class Entity<
    _Node extends Node<_Node, _Ent> = Node<any, any>,
    _Ent extends Entity<_Node, _Ent> = Entity<any, any>
> {
    private readonly _ID = (() => {
        return globalEntityId++
    })()
    abstract readonly node: _Node
    abstract readonly name: string
    equals(other: any): boolean {
        if (FwRef.is(other)) {
            return this.equals(other["__pull__"]())
        }
        return Object.is(this, other)
    }

    protected __kids__(): Iterable<_Ent> {
        return []
    }

    protected __parent__(): _Ent | undefined {
        return undefined
    }

    protected __needs__(): Record<string, _Ent | undefined | _Ent[]> {
        return {}
    }
}

export type Formats = "local" | "source" | undefined
