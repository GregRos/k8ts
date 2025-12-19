import { Seq, seq } from "doddle"
import { Kind } from "../api-kind"
import { RefKey } from "../ref-key"
import { ForwardRef } from "../reference"
import { Relation } from "./dependencies"
export type LiteralModes = "simple" | "pretty" | "prefix"

export abstract class BaseEntity<
    Node extends BaseNode<Node, Entity> = BaseNode<any, any>,
    Entity extends BaseEntity<Node, Entity> = BaseEntity<any, any>
> {
    abstract readonly node: Node
    abstract readonly kind: Kind.IdentParent
    abstract readonly name: string
    protected __kids__(): Entity[] {
        return []
    }

    protected __parent__(): Entity | undefined {
        return undefined
    }

    protected __needs__(): Record<string, Entity | undefined | Entity[]> {
        return {}
    }
}

export abstract class BaseNode<
    Node extends BaseNode<Node, Entity> = BaseNode<any, any>,
    Entity extends BaseEntity<Node, Entity> = BaseEntity<any, any>
> {
    get key(): RefKey {
        return RefKey.make(this.kind, this.name)
    }
    get kind() {
        return this._entity.kind
    }

    get kids() {
        return seq(this._entity["__kids__"]()).map(x => x.node)
    }
    get relations() {
        const needs = this._entity["__needs__"]()
        return seq(function* () {
            for (const [relName, target] of Object.entries(needs)) {
                if (Array.isArray(target)) {
                    for (const t of target) {
                        if (t) {
                            yield new Relation<Node>(relName, t.node)
                        }
                    }
                } else {
                    if (target) {
                        yield new Relation<Node>(relName, target.node)
                    }
                }
            }
        })
    }

    get parent(): Node | null {
        return this._entity["__parent__"]()?.node ?? null
    }

    protected get _asNode() {
        return this as any as Node
    }

    constructor(readonly _entity: Entity) {}

    get shortFqn() {
        return `${this.kind.name}/${this.name}`
    }

    get root(): Node {
        return (this.ancestors.at(-1).pull() as any) ?? (this as any)
    }
    get name() {
        return this._entity.name
    }
    get isRoot() {
        return this.parent === null && this._entity.kind.name !== "PodTemplate"
    }

    equals(other: any) {
        if (ForwardRef.is(other)) {
            return other.equals(this)
        }
        return Object.is(this._entity, other._entity)
    }

    readonly ancestors = seq(() => {
        const seen = new Set<Node>()
        const recurse = function* (from: Node): Iterable<Node> {
            const parent = from.parent
            if (parent && !seen.has(parent)) {
                seen.add(parent)
                yield parent
                yield* recurse(parent)
            }
        }
        return seq(recurse.bind(null, this._asNode))
    }).cache()

    readonly descendants = seq(() => {
        const self = this
        let seen = new Set<Node>()
        const recurse = function* (from: Node): Iterable<Node> {
            for (const kid of from.kids) {
                if (seen.has(kid)) {
                    continue
                }
                seen = seen.add(kid)
                yield kid
                yield* recurse(kid)
            }
        }
        return seq(recurse.bind(null, self._asNode))
    }).cache()

    isParentOf(other: Node): boolean {
        if (ForwardRef.is(other)) {
            return other.isChildOf(this._asNode)
        }
        return new Set(this.descendants).has(other)
    }

    isChildOf(other: Node): boolean {
        if (ForwardRef.is(other)) {
            return other.isParentOf(this._asNode)
        }
        return this.equals(other) || new Set(this.ancestors).has(other._asNode)
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
    })

    readonly recursiveRelations = seq(() => {
        let resources = new Set<Node>()
        const recurseIntoDependency = function* (root: Relation<Node>): Iterable<Relation<Node>> {
            yield root
            if (resources.has(root.needed)) {
                return
            }
            resources = resources.add(root.needed)

            const ownDeps = root.needed.relations
            for (const needsEdge of ownDeps) {
                yield* recurseIntoDependency(needsEdge)
            }
        }
        return seq(recurseIntoDependency.bind(null, new Relation<Node>("self", this._asNode)))
            .after(() => {
                resources = new Set()
            })
            .cache()
    })
}
export type Formats = "local" | "source" | undefined
