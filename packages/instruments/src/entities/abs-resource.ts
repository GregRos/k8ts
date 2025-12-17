import { displayers, Kind, Origin, RefKey, ResourceEntity, ResourceNode } from "@k8ts/instruments"

@displayers({
    simple: s => s.node,
    pretty: s => s.node
})
export abstract class AbsResource<Props extends object = object> implements ResourceEntity {
    #origin: Origin
    abstract readonly kind: Kind.Identifier<string, Kind.Identifier>

    with(callback: (self: this) => void) {
        callback(this)
        return this
    }

    protected constructor(
        origin: Origin,
        readonly name: string,
        readonly props: Props
    ) {
        this.#origin = origin
        this.name = name
    }

    get node(): ResourceNode {
        return new ResourceNode(this.#origin, this, RefKey.make(this.kind, this.name))
    }

    get shortFqn() {
        return [this.node.origin.name, [this.kind.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
