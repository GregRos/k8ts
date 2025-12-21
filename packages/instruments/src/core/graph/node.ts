import { seq, type Seq } from "doddle"
import { FwReference } from "../reference"
import type { Entity } from "./entity"
import { Relation } from "./relation"

export abstract class Node<
    _Node extends Node<_Node, _Entity> = Node<any, any>,
    _Entity extends Entity<_Node, _Entity> = Entity<any, any>
> {
    get kids() {
        return seq(this.entity["__kids__"]()).map(x => x.node)
    }
    get relations() {
        const needs = this.entity["__needs__"]()
        return seq(function* () {
            for (const [relName, target] of Object.entries(needs)) {
                if (Array.isArray(target)) {
                    for (const t of target) {
                        if (t) {
                            yield new Relation<_Node>(relName, t.node)
                        }
                    }
                } else {
                    if (target) {
                        yield new Relation<_Node>(relName, target.node)
                    }
                }
            }
        })
    }

    get parent(): _Node | null {
        return this.entity["__parent__"]()?.node ?? null
    }

    protected get _asNode() {
        return this as any as _Node
    }
    private readonly _ID: number
    constructor(readonly entity: _Entity) {
        this._ID = this.entity["_ID"]
    }

    get root(): _Node {
        return (this.ancestors.at(-1).pull() as any) ?? (this as any)
    }
    get name() {
        return this.entity.name
    }
    get isRoot() {
        return this.parent === null
    }
    equals(other: any): boolean {
        if (FwReference.is(other)) {
            return this.equals(other["__pull__"]())
        }
        if (other instanceof Node === false) {
            return false
        }
        return this.entity.equals(other.entity)
    }

    readonly ancestors = seq((): _Node[] => {
        const seen = [] as _Node[]
        const recurse = function (from: _Node) {
            const parent = from.parent
            if (parent && !seen.find(x => x.equals(parent))) {
                seen.push(parent)
                recurse(parent)
            }
        }
        recurse(this._asNode)
        return seen
    })

    readonly descendants = seq((): _Node[] => {
        const self = this
        let seen = [] as _Node[]
        const recurse = function (from: _Node) {
            for (const kid of from.kids) {
                if (seen.find(x => x.equals(kid))) {
                    continue
                }
                seen.push(kid)
                recurse(kid)
            }
        }
        recurse(this._asNode)
        return seen
    })

    isParentOf(other: _Node): boolean {
        if (FwReference.is(other)) {
            return other.isChildOf(this._asNode)
        }
        return other.equals(this) || other.ancestors.some(x => x.equals(this)).pull()
    }

    isChildOf(other: _Node): boolean {
        if (FwReference.is(other)) {
            return other.isParentOf(this._asNode)
        }
        return this.equals(other) || this.ancestors.some(x => x.equals(other)).pull()
    }

    hasRelationTo(other: _Node): boolean {
        return this.recursiveRelations.some(x => x.needed.equals(other)).pull()
    }

    readonly recursiveRelationsSubtree = seq((): Seq<Relation<_Node>> => {
        const self = this
        return seq(function* () {
            for (const child of [self, ...self.descendants] as _Node[]) {
                yield* child.recursiveRelations
            }
        }) as any
    })

    readonly recursiveRelations = seq(() => {
        let resources = [] as _Node[]
        const recurseIntoDependency = function* (root: Relation<_Node>): Iterable<Relation<_Node>> {
            yield root
            if (resources.find(r => r.equals(root.needed))) {
                return
            }
            resources.push(root.needed)

            const ownDeps = root.needed.relations
            for (const needsEdge of ownDeps) {
                yield* recurseIntoDependency(needsEdge)
            }
        }
        return seq(recurseIntoDependency.bind(null, new Relation<_Node>("self", this._asNode)))
            .after(() => {
                resources = []
            })
            .cache()
    })
}
