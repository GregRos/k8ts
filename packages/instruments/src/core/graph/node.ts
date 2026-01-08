import { seq, type Seq } from "doddle"
import { Entity } from "./entity"
import { Relation } from "./relation"
import { ForwardRef } from "./resource/forward/ref"
/**
 * The {@link Vertex} is a wrapper around a {@link Entity} that provides traversal, display, and other
 * utilities. Note that the {@link Vertex} itself is immutable. Changes only happen to the underlying
 * {@link Entity}.
 *
 * Two {@link Vertex} instances are considered equal if they wrap the same {@link Entity}, even if
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
export abstract class Vertex<
    _Node extends Vertex<_Node, _Entity> = Vertex<any, any>,
    _Entity extends Entity<_Node, _Entity> = Entity<any, any>
> {
    /** The nodes of child entities. */

    constructor(readonly entity: _Entity) {}
    get kids() {
        return seq(this.entity["__kids__"]()).map(x => x.mustBe(Entity).vertex as _Node)
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
                                t.mustBe(Entity<_Node, _Entity>).vertex
                            )
                        }
                    }
                } else {
                    if (target) {
                        yield new Relation<_Node>(
                            relName,
                            target.mustBe(Entity<_Node, _Entity>).vertex
                        )
                    }
                }
            }
        })
    }

    /** The node for this node's parent entity. */
    get parent(): _Node | null {
        return (this.entity["__parent__"]()?.mustBe(Entity).vertex as any) ?? null
    }

    /**
     * The root node of this node's entity tree. Doesn't cross tree boundaries, so the root of a
     * Resource-level tree.
     */
    get root(): _Node {
        return (this.ancestors.at(-1).pull() as any) ?? (this as any)
    }

    get isRoot() {
        return this.parent === null
    }
    equals(other: any): boolean {
        if (!other) {
            return false
        }
        if (ForwardRef.is(other)) {
            return this.equals(other["__pull__"]())
        }
        if (other instanceof Vertex === false) {
            return false
        }
        return this.entity.equals(other.entity)
    }

    readonly ancestors = seq((): Vertex[] => {
        const seen = [] as Vertex[]
        const recurse = function (from: Vertex) {
            const parent = from.parent
            if (parent && !seen.find(x => x.equals(parent))) {
                seen.push(parent)
                recurse(parent)
            }
        }
        recurse(this)
        return seen
    }).as<_Node>()

    readonly descendants = seq((): Vertex[] => {
        const self = this
        let seen = [] as Vertex[]
        const recurse = function (from: Vertex) {
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

    isParentOf(other: Vertex): boolean {
        if (ForwardRef.is(other)) {
            return other.isChildOf(this)
        }
        return other.equals(this) || other.ancestors.some(x => x.equals(this)).pull()
    }

    isChildOf(other: Vertex): boolean {
        if (ForwardRef.is(other)) {
            return other.isParentOf(this)
        }
        return this.equals(other) || this.ancestors.some(x => x.equals(other)).pull()
    }

    hasRelationTo(other: Vertex): boolean {
        return this.recursiveRelations.some(x => x.needed.equals(other)).pull()
    }

    readonly recursiveRelationsSubtree = seq((): Seq<Relation<Vertex>> => {
        const self = this
        return seq(function* () {
            for (const child of [self, ...self.descendants] as Vertex[]) {
                yield* child.recursiveRelations
            }
        }) as any
    }).as<Relation<_Node>>()

    readonly recursiveRelations = seq(() => {
        let resources = [] as Vertex[]
        const recurseIntoDependency = function* (
            root: Relation<Vertex>
        ): Iterable<Relation<Vertex>> {
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
