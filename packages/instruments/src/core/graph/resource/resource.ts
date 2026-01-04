import { getDeepPropertyDescriptor } from "@k8ts/metadata/util"
import { getNiceClassName } from "what-are-you"
import { display } from "../../../utils"
import { Entity } from "../entity"
import { K8tsGraphError } from "../error"
import type { Origin } from "../origin"
import type { Ident } from "./api-kind"
import { ForwardRef } from "./exports"
import { ResourceNode } from "./resource-node"
import { type ResourceRef } from "./resource-ref"

@display({
    simple: s => s.node,
    pretty: s => s.node
})
export abstract class Resource<
    Name extends string = string,
    Props extends object = object
> extends Entity<ResourceNode, Resource, ResourceRef> {
    abstract get ident(): Ident

    with(callback: (self: this) => void) {
        callback(this)
        return this
    }

    abstract readonly namespace: string | undefined

    get ref() {
        return {
            kind: this.ident.name,
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
        const desc = getDeepPropertyDescriptor(this, "ident")
        if (!desc || !desc.get) {
            throw new K8tsGraphError(
                `ResourceEntity subclass ${getNiceClassName(this)} must implement the 'ident' property as a getter, but it's missing or not a getter.`
            )
        }
    }

    equals(other: any): boolean {
        if (!other) {
            return false
        }
        if (ForwardRef.is(other)) {
            return other.equals(this)
        }
        if (other instanceof Resource) {
            return Object.is(this, other)
        }
        return false
    }

    protected abstract __origin__(): Origin
    get node(): ResourceNode {
        return new ResourceNode(this.__origin__().node, this)
    }

    get shortFqn() {
        return [this.node.origin.name, [this.ident.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
