import { seq, type Seq } from "doddle"
import { Entity } from "./entity"
import { Relation } from "./relation"
import { FwRef } from "./resource/reference/fw-ref"
/**
 * The {@link Node} is a wrapper around a {@link Entity} that provides traversal, display, and other
 * utilities. Note that the {@link Node} itself is immutable. Changes only happen to the underlying
 * {@link Entity}.
 *
 * Two {@link Node} instances are considered equal if they wrap the same {@link Entity}, even if
 * they're different instances.
 *
 * Node classes are primarily used for traversal in the graph structure formed by {@link Entity}
 * instances. They provide methods to navigate parent-child relationships, access metadata, and
 * explore dependencies between entities.
 *
 * This is mainly done in the manifestation pipeline, but users can also rely on it to construct
 * resources dynamically.
 *
 * Accessing the `Node` of an `Entity` always forces any `FwRef` instances to resolve.
 */
export abstract class Node<
    _Node extends Node<_Node, _Entity> = Node<any, any>,
    _Entity extends Entity<_Node, _Entity> = Entity<any, any>
> {
    /** The nodes of child entities. */

    private readonly _ID: number
    constructor(readonly entity: _Entity) {
        this._ID = this.entity["_ID"]
    }
    get kids() {
        return seq(this.entity["__kids__"]()).map(x => x.assert(Entity).node as _Node)
    }
    /** The direct **needs** of this this node's entity. */
    get relations() {
        const needs = seq(() => {
            return seq.fromObject(this.entity["__needs__"]())
        })
        return seq(function* () {
            for (const [relName, target] of needs) {
                if (Array.isArray(target)) {
                    for (const t of target) {
                        if (t) {
                            yield new Relation<_Node>(
                                relName,
                                t.assert(Entity<_Node, _Entity>).node
                            )
                        }
                    }
                } else {
                    if (target) {
                        yield new Relation<_Node>(
                            relName,
                            target.assert(Entity<_Node, _Entity>).node
                        )
                    }
                }
            }
        })
    }

    /** The node for this node's parent entity. */
    get parent(): _Node | null {
        return (this.entity["__parent__"]()?.assert(Entity).node as any) ?? null
    }

    /**
     * The root node of this node's entity tree. Doesn't cross tree boundaries, so the root of a
     * Resource-level tree.
     */
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
        if (FwRef.is(other)) {
            return this.equals(other["__pull__"]())
        }
        if (other instanceof Node === false) {
            return false
        }
        return this.entity.equals(other.entity)
    }

    readonly ancestors = seq((): Node[] => {
        const seen = [] as Node[]
        const recurse = function (from: Node) {
            const parent = from.parent
            if (parent && !seen.find(x => x.equals(parent))) {
                seen.push(parent)
                recurse(parent)
            }
        }
        recurse(this)
        return seen
    }).as<_Node>()

    readonly descendants = seq((): Node[] => {
        const self = this
        let seen = [] as Node[]
        const recurse = function (from: Node) {
            for (const kid of from.kids) {
                if (seen.find(x => x.equals(kid))) {
                    continue
                }
                seen.push(kid)
                recurse(kid)
            }
        }
        recurse(this)
        return seen
    }).as<_Node>()

    isParentOf(other: Node): boolean {
        if (FwRef.is(other)) {
            return other.isChildOf(this)
        }
        return other.equals(this) || other.ancestors.some(x => x.equals(this)).pull()
    }

    isChildOf(other: Node): boolean {
        if (FwRef.is(other)) {
            return other.isParentOf(this)
        }
        return this.equals(other) || this.ancestors.some(x => x.equals(other)).pull()
    }

    hasRelationTo(other: Node): boolean {
        return this.recursiveRelations.some(x => x.needed.equals(other)).pull()
    }

    readonly recursiveRelationsSubtree = seq((): Seq<Relation<Node>> => {
        const self = this
        return seq(function* () {
            for (const child of [self, ...self.descendants] as Node[]) {
                yield* child.recursiveRelations
            }
        }) as any
    }).as<Relation<_Node>>()

    readonly recursiveRelations = seq(() => {
        let resources = [] as Node[]
        const recurseIntoDependency = function* (root: Relation<Node>): Iterable<Relation<Node>> {
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
        return seq(recurseIntoDependency.bind(null, new Relation<_Node>("self", this)))
            .after(() => {
                resources = []
            })
            .cache()
    })
}
