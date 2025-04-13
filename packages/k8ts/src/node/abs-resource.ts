import { displayers, Kind, Origin, RefKey, ResourceEntity, ResourceNode } from "@k8ts/instruments"
import { Doddle, doddle } from "doddle"

export interface ResourceIdentBlock {
    kind: Kind.IdentParent
    name: string
}
@displayers({
    simple: s => s.node,
    pretty: s => s.node
})
export abstract class AbsResource<Props extends object = object> implements ResourceEntity {
    abstract readonly kind: Kind.Identifier<string, Kind.Identifier>

    private _node: Doddle<ResourceNode>

    with(callback: (self: this) => void) {
        callback(this)
        return this
    }
    get node() {
        return this._node.pull()
    }
    protected constructor(
        origin: Origin,
        public name: string,
        readonly props: Props
    ) {
        this._node = doddle(() => new ResourceNode(origin, this, RefKey.make(this.kind, this.name)))
    }

    get shortFqn() {
        return [this.node.origin.name, [this.kind.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
