import { getDeepPropertyDescriptor } from "@k8ts/metadata/util"
import { getNiceClassName } from "what-are-you"
import { displayers } from "../../../utils"
import { Entity } from "../entity"
import type { OriginEntity } from "../origin"
import type { Ident } from "./api-kind"
import { ResourceNode } from "./node"
import { FwRef, type ResourceRef } from "./reference"

@displayers({
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
        if (other instanceof Resource) {
            return Object.is(this, other)
        }
        return false
    }

    protected abstract __origin__(): OriginEntity
    get node(): ResourceNode {
        return new ResourceNode(this.__origin__().node, this)
    }

    get shortFqn() {
        return [this.node.origin.name, [this.ident.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
