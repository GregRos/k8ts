import { Origin, RefKey, ResourceNode, type Kind } from "@k8ts/instruments"
import { Doddle, doddle } from "doddle"
export interface DependsOn {
    resource: AbsResource
    text: string
}

export abstract class AbsResource<Props extends object = object> {
    abstract readonly kind: Kind.Identifier

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
            return new ResourceNode(origin, this, RefKey.make(this["kind"], this.name))
        })
    }

    get shortFqn() {
        return [this.node.origin.name, [this.kind.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
