import { Seq, seq } from "doddle"
import { Kind } from "../api-kind"
import { RefKey } from "../ref-key"
import { FwReference } from "../reference"
import { Relation } from "./relation"
export type LiteralModes = "simple" | "pretty" | "prefix"

let globalEntityId = 0
export abstract class BaseEntity<
    Node extends BaseNode<Node, Entity> = BaseNode<any, any>,
    Entity extends BaseEntity<Node, Entity> = BaseEntity<any, any>
> {
    private readonly _ID = (() => {
        const s = this
        let a = 1
        return globalEntityId++
    })()
    abstract readonly node: Node
    abstract readonly kind: Kind.IdentParent
    abstract readonly name: string
    equals(other: any): boolean {
        if (FwReference.is(other)) {
            return this.equals(other["__pull__"]())
        }
        return Object.is(this, other)
    }

    protected __kids__(): Iterable<Entity> {
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
        return this.entity.kind
    }

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
        return this.entity["__parent__"]()?.node ?? null
    }

    protected get _asNode() {
        return this as any as Node
    }
    private readonly _ID: number
    constructor(readonly entity: Entity) {
        this._ID = this.entity["_ID"]
    }

    get shortFqn() {
        return `${this.kind.name}/${this.name}`
    }

    get root(): Node {
        return (this.ancestors.at(-1).pull() as any) ?? (this as any)
    }
    get name() {
        return this.entity.name
    }
    get isRoot() {
        return this.parent === null && this.entity.kind.name !== "PodTemplate"
    }

    equals(other: any): boolean {
        if (FwReference.is(other)) {
            return this.equals(other["__pull__"]())
        }
        if (other instanceof BaseNode === false) {
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
        recurse(this._asNode)
        return seen
    })

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
        recurse(this._asNode)
        return seen
    })

    isParentOf(other: Node): boolean {
        if (FwReference.is(other)) {
            return other.isChildOf(this._asNode)
        }
        return other.equals(this) || other.ancestors.some(x => x.equals(this)).pull()
    }

    isChildOf(other: Node): boolean {
        if (FwReference.is(other)) {
            return other.isParentOf(this._asNode)
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
    })

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
        return seq(recurseIntoDependency.bind(null, new Relation<Node>("self", this._asNode)))
            .after(() => {
                resources = []
            })
            .cache()
    })
}
export type Formats = "local" | "source" | undefined
