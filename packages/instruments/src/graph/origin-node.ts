import { Meta } from "@k8ts/metadata/."
import { seq, Seq } from "doddle/."
import { Kind } from "../api-kind"
import { KindMap } from "../kind-map"
import { RefKey } from "../ref-key"
import { BaseEntity, BaseNode } from "./base-node"
import { ResourceNode } from "./resource-node"

export class Origin extends BaseNode<Origin, OriginEntity> implements Iterable<ResourceNode> {
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

    private __attach_resource_class__(kind: Kind.Identifier) {
        return <F extends Function>(ctor: F) => {
            this._kindMap.add(kind, ctor)
            return ctor
        }
    }

    private __attach_child__(child: Origin) {
        this._kids.push(child)
    }

    private __attach_resource_instances__(resources: Iterable<ResourceNode>) {
        if (!this._kindMap) this._attached = this._attached.concat(seq(resources).cache())
    }
}
export interface OriginEntity extends BaseEntity<Origin> {
    meta: Meta
}
