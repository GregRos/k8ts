import { displayers, Origin, RefKey, ResourceNode, type Kind } from "@k8ts/instruments"
export interface DependsOn {
    resource: AbsResource
    text: string
}
@displayers({
    default: s => s.node,
    pretty: s => s.node
})
export abstract class AbsResource<Props extends object = object> {
    abstract readonly kind: Kind.Identifier

    readonly node: ResourceNode

    constructor(
        origin: Origin,
        readonly name: string,
        readonly props: Props
    ) {
        this.node = new ResourceNode(origin, this, RefKey.make(this["kind"], this.name))
    }

    get shortFqn() {
        return [this.node.origin.name, [this.kind.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
