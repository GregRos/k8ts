import { Seq, seq } from "doddle"
import { hash, Set } from "immutable"
import { Kind } from "../api-kind"
import { RefKey } from "../ref-key"
import { ForwardRef } from "../reference"
import { Traced } from "../tracing"
import { NeedsEdge } from "./dependencies"

export interface BaseEntity<Node extends BaseNode<Node>> {
    readonly node: Node

    readonly shortFqn: string
    readonly kind: Kind.Identifier
    readonly name: string
}

export abstract class BaseNode<
    Node extends BaseNode<Node, Entity>,
    Entity extends BaseEntity<Node> = BaseEntity<Node>
> extends Traced {
    abstract readonly key: RefKey
    get kind() {
        return this.key.kind
    }

    abstract readonly kids: Seq<Node>
    abstract readonly needs: Seq<NeedsEdge<Node>>
    abstract readonly parent: Node | null
    protected get _asNode() {
        return this as any as Node
    }

    constructor(readonly _entity: Entity) {
        super()
    }

    get shortFqn() {
        return `${this.kind.name}/${this.name}`
    }
    get root() {
        return this.ancestors.at(-1).pull()!
    }
    get name() {
        return this.key.name
    }
    get isRoot() {
        return this.parent === null
    }

    hashCode() {
        return hash(this)
    }
    equals(other: any) {
        if (ForwardRef.is(other)) {
            return other.equals(this)
        }
        return this === other
    }

    readonly ancestors = seq(() => {
        const seen = Set<Node>()
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
        let seen = Set<Node>()
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
        return Set(this.descendants).has(other)
    }

    isChildOf(other: Node): boolean {
        if (ForwardRef.is(other)) {
            return other.isParentOf(this._asNode)
        }
        return this.equals(other) || Set(this.ancestors).has(other._asNode)
    }

    isNeeding(other: Node): boolean {
        return this.needsGraph.some(x => x.needed.equals(other)).pull()
    }

    readonly needsGraph = seq(() => {
        let resources = Set<Node>()
        const recurseIntoDependency = function* (root: NeedsEdge<Node>): Iterable<NeedsEdge<Node>> {
            yield root
            if (resources.has(root.needed)) {
                return
            }
            resources = resources.add(root.needed)

            const ownDeps = root.needed.needs
            for (const needsEdge of ownDeps) {
                yield* recurseIntoDependency(needsEdge)
            }
        }
        return seq(recurseIntoDependency.bind(null, new NeedsEdge<Node>("self", this._asNode)))
            .after(() => {
                resources = Set()
            })
            .cache()
    })
}
export type Formats = "short" | "fqn" | "shortFqn"
