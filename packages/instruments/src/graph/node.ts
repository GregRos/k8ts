import { Seq, seq } from "doddle/."
import { Set } from "immutable"
import { Kind } from "../api-kind"
import { KindMap } from "../kind-map"
import { RefKey } from "../ref-key"
import { ForwardRef } from "../reference"
import { Traced } from "../tracing"

export type Formats = "short" | "fqn" | "shortFqn"

export interface X_Entity<Node extends X_Node<Node>> {
    readonly node: Node

    readonly name: string
}
export interface R_Entity extends X_Entity<R_Node> {}
export class NeedsEdge<Node extends X_Node<Node>> {
    constructor(
        readonly needing: Node,
        readonly why: string,
        readonly needed: Node
    ) {}
}

export abstract class X_Node<
    Node extends X_Node<Node, Entity>,
    Entity extends X_Entity<Node> = X_Entity<Node>
> extends Traced {
    abstract hashCode(): number
    abstract readonly kind: Kind.Identifier
    abstract readonly kids: Seq<Node>
    abstract readonly needs: Seq<NeedsEdge<Node>>
    protected abstract readonly _asNode: Node

    constructor(
        readonly parent: Node | null,
        protected readonly _entity: Entity
    ) {
        super()
    }
    get root() {
        return this.ancestors.at(-1)
    }
    get name() {
        return this._entity.name
    }
    get isRoot() {
        return this.parent === null
    }
    equals(other: any) {
        if (ForwardRef.is(other)) {
            return other.equals(this)
        }
        if (!(other instanceof this.constructor)) {
            return false
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
        return Set(this.ancestors).has(other._asNode)
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
        return seq(
            recurseIntoDependency.bind(
                null,
                new NeedsEdge<Node>(this._asNode, "self", this._asNode)
            )
        )
            .after(() => {
                resources = Set()
            })
            .cache()
    })
}

export abstract class R_Node extends X_Node<R_Node, R_Entity> {
    abstract readonly key: RefKey
    format(format: Formats) {
        switch (format) {
            case "short":
                return this.name
            case "fqn":
                return this.key.string
            case "shortFqn":
                return this.key.name
        }
    }
    constructor(
        entity: R_Entity,
        parent: R_Node | null,
        readonly origin: O_Node
    ) {
        super(parent, entity)
    }
}

export interface O_Entity extends X_Entity<O_Node> {}
export abstract class O_Node extends X_Node<O_Node, O_Entity> implements Iterable<R_Node> {
    private _kindMap = new KindMap()
    private _attached = seq.empty<R_Node>();

    [Symbol.iterator]() {
        return this.resources[Symbol.iterator]()
    }
    readonly attachedTree: Seq<R_Node> = seq(() => {
        const self = this
        const desc = self.descendants.prepend(this).concatMap(function* (x) {
            yield* self.resources
            for (const kid of self.kids) {
                yield* kid.resources
            }
        })
        return desc
    }).cache()

    get resources() {
        return this._attached
    }

    __attach_kind__(kind: Kind.Identifier) {
        return <F extends Function>(ctor: F) => {
            this._kindMap.add(kind, ctor)
            return ctor
        }
    }

    __attach_instance__(resources: Iterable<R_Node>) {
        this._attached = this._attached.concat(resources)
    }
}

let a: O_Node = null!
