import { getNiceClassName } from "what-are-you"
import { getDeepPropertyDescriptor } from "../../../../../metadata/dist/utils/map"
import { display } from "../../../utils"
import { Entity } from "../entity"
import { K8tsGraphError } from "../error"
import type { Origin } from "../origin"
import type { GVK_Base } from "./api-kind"
import { ForwardRef } from "./forward"
import { ResourceVertex } from "./node"
import { type ResourceRef } from "./ref"

@display({
    simple: s => s.vertex,
    pretty: s => s.vertex
})
export abstract class Resource<
    Name extends string = string,
    Props extends object = object
> extends Entity<ResourceVertex, Resource, ResourceRef> {
    abstract get kind(): GVK_Base

    abstract readonly namespace: string | undefined

    constructor(
        readonly name: Name,
        readonly props: Props
    ) {
        super()

        this.name = name
        const desc = getDeepPropertyDescriptor(this, "kind")
        if (!desc || !desc.get) {
            throw new K8tsGraphError(
                `ResourceEntity subclass ${getNiceClassName(this)} must implement the 'kind' property as a getter, but it's missing or not a getter.`
            )
        }
    }
    is<K extends this["kind"]>(kind: K): this is { kind: K }
    is<Inst extends ResourceRef = ResourceRef>(
        cls: abstract new (...args: any[]) => Inst
    ): this is Inst
    is(cls: any): boolean {
        if (typeof cls === "function") {
            return this instanceof cls
        }
        return this.kind.equals(cls)
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
    get vertex(): ResourceVertex {
        return new ResourceVertex(this.__origin__().vertex, this)
    }
}
