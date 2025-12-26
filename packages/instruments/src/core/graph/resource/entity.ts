import { getDeepPropertyDescriptor } from "@k8ts/metadata/util"
import { getNiceClassName } from "what-are-you"
import { displayers } from "../../../utils"
import { Entity } from "../entity"
import type { Origin_Entity } from "../origin"
import type { Kind } from "./api-kind"
import { Rsc_Node } from "./node"
import { FwRef } from "./reference"

@displayers({
    simple: s => s.node,
    pretty: s => s.node
})
export abstract class Rsc_Entity<
    Name extends string = string,
    Props extends object = object
> extends Entity<Rsc_Node, Rsc_Entity> {
    abstract get kind(): Kind.KindLike

    with(callback: (self: this) => void) {
        callback(this)
        return this
    }

    abstract readonly namespace: string | undefined

    get ref() {
        return {
            kind: this.kind.name,
            name: this.name,
            namespace: this.namespace
        }
    }

    constructor(
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

    equals(other: any): boolean {
        if (!other) {
            return false
        }
        if (FwRef.is(other)) {
            return other.equals(this)
        }
        if (other instanceof Rsc_Entity) {
            return Object.is(this, other)
        }
        return false
    }

    protected abstract __origin__(): Origin_Entity
    get node(): Rsc_Node {
        return new Rsc_Node(this.__origin__().node, this)
    }

    get shortFqn() {
        return [this.node.origin.name, [this.kind.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
