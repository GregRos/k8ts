import { getDeepPropertyDescriptor } from "@k8ts/metadata/util"
import { getNiceClassName } from "what-are-you"
import { displayers } from "../../../utils"
import type { Kind } from "../../api-kind"
import { Entity } from "../entity"
import type { Origin_Entity } from "../origin"
import { Resource_Node } from "./resource-node"

@displayers({
    simple: s => s.node,
    pretty: s => s.node
})
export abstract class Resource_Entity<
    Name extends string = string,
    Props extends object = object
> extends Entity<Resource_Node, Resource_Entity> {
    abstract get kind(): Kind.IdentParent

    with(callback: (self: this) => void) {
        callback(this)
        return this
    }

    abstract readonly namespace: string | undefined

    protected constructor(
        readonly name: Name,
        readonly props: Props
    ) {
        super()

        this.name = name
        const desc = getDeepPropertyDescriptor(this, "kind")
        if (!desc || !desc.get) {
            throw new Error(
                `ResourceEntity subclass ${getNiceClassName(this)} must implement the 'kind' property as a getter, but it's missing or not a getter.`
            )
        }
    }

    protected abstract __origin__(): Origin_Entity
    get node(): Resource_Node {
        return new Resource_Node(this.__origin__().node, this)
    }

    get shortFqn() {
        return [this.node.origin.name, [this.kind.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
