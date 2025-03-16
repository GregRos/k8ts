import { _impl, Origin, RefKey, ResourceNode, ResourceNodeImpl, type Kind } from "@k8ts/instruments"
import { Doddle, doddle } from "doddle/."
export interface DependsOn {
    resource: AbsResource
    text: string
}

export abstract class AbsResource<Props extends object = object> implements _impl {
    abstract readonly kind: Kind.Identifier

    private __NODE_IMPL__!: ResourceNodeImpl
    private _node: Doddle<ResourceNode>

    get node() {
        return this._node.pull()
    }

    constructor(
        origin: Origin,
        readonly name: string,
        readonly props: Props
    ) {
        this._node = doddle(() => {
            return new ResourceNode(
                origin,
                this,
                RefKey.make(this["kind"], this.name),
                this.__NODE_IMPL__
            )
        })
    }

    get shortFqn() {
        return [this.node.origin.name, [this.kind.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
