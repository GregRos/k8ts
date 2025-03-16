import { Meta } from "@k8ts/metadata/."
import { Seq, seq } from "doddle/."
import { hash, Set } from "immutable"
import { Kind } from "../api-kind"
import { KindMap } from "../kind-map"
import { RefKey } from "../ref-key"
import { ForwardRef } from "../reference"
import { Traced } from "../tracing"
export type Formats = "short" | "fqn" | "shortFqn"

export interface X_Entity<Node extends X_Node<Node>> {
    readonly node: Node

    readonly kind: Kind.Identifier
    readonly name: string
}
export interface ResourceEntity extends X_Entity<ResourceNode> {}
export class NeedsEdge<Node extends X_Node<Node>> {
    constructor(
        readonly why: string,
        readonly needed: Node
    ) {}
}

export abstract class X_Node<
    Node extends X_Node<Node, Entity>,
    Entity extends X_Entity<Node> = X_Entity<Node>
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
        return seq(recurseIntoDependency.bind(null, new NeedsEdge<Node>("self", this._asNode)))
            .after(() => {
                resources = Set()
            })
            .cache()
    })
}

export interface ResourceNodeImplTypes {
    parent: ResourceNode | null
    kids: Iterable<ResourceNode>
    needs: Iterable<NeedsEdge<ResourceNode>>
}
export interface ResourceNodeImpl {
    kids(): Iterable<ResourceNode>
    parent(): ResourceNode | null
    needs(): Iterable<NeedsEdge<ResourceNode>>
}

export class ResourceNode extends X_Node<ResourceNode, ResourceEntity> {
    get needs() {
        return seq(this._impl.needs)
    }

    get kids() {
        return seq(this._impl.kids)
    }

    get parent() {
        return this._impl.parent()
    }

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
        readonly origin: Origin,
        readonly entity: ResourceEntity,
        readonly key: RefKey,
        private readonly _impl: ResourceNodeImpl
    ) {
        super(entity)
    }
}

export interface OriginEntity extends X_Entity<Origin> {
    meta: Meta
}
export class Origin extends X_Node<Origin, OriginEntity> implements Iterable<ResourceNode> {
    private _kids = [] as Origin[]
    get kids() {
        return seq(this._kids)
    }
    get meta() {
        return this._entity.meta
    }

    constructor(
        readonly parent: Origin | null,
        entity: OriginEntity,
        readonly key: RefKey
    ) {
        super(entity)
    }
    get resourceKinds() {
        return this._kindMap
    }
    private _kindMap = new KindMap()
    private _attached = seq.empty<ResourceNode>()

    get needs() {
        return seq.empty()
    }
    [Symbol.iterator]() {
        return this.resources[Symbol.iterator]()
    }
    readonly attachedTree: Seq<ResourceNode> = seq(() => {
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

    __attach_resource_class__(kind: Kind.Identifier) {
        return <F extends Function>(ctor: F) => {
            this._kindMap.add(kind, ctor)
            return ctor
        }
    }

    __attach_child__(child: Origin) {
        this._kids.push(child)
    }

    __attach_resource_instances__(resources: Iterable<ResourceNode>) {
        this._attached = this._attached.concat(seq(resources).cache())
    }
}
