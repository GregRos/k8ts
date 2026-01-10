import { getNiceClassName } from "what-are-you"
import { ResourceIdent } from "."

import { display } from "../../../utils"
import { EntityBase } from "../entity"
import { K8tsGraphError } from "../error"
import type { OriginEntity } from "../origin"
import { ForwardRef } from "./forward"
import type { Gvk_Base } from "./gvk"
import { Resource_Props } from "./props"
import { type ResourceRef } from "./ref"
import { getDeepPropertyDescriptor } from "./util"
import { ResourceVertex } from "./vertex"
@display({
    simple: s => s.__vertex__,
    pretty: s => s.__vertex__
})
export abstract class ResourceEntity<
        Name extends string = string,
        Props extends Resource_Props = Resource_Props
    >
    extends EntityBase<ResourceVertex, ResourceEntity, ResourceRef>
    implements ResourceRef
{
    abstract get kind(): Gvk_Base
    ident: ResourceIdent<Gvk_Base, Name>
    readonly props: Props
    constructor(name: Name, namespace: string | undefined, props: Props) {
        super()
        this.props = props

        const desc = getDeepPropertyDescriptor(this, "kind")
        if (!desc || !desc.get) {
            throw new K8tsGraphError(
                `ResourceEntity subclass ${getNiceClassName(this)} must implement the 'kind' property as a getter, but it's missing or not a getter.`
            )
        }
        const kind = (this as any).kind as Gvk_Base
        this.ident = new ResourceIdent(kind, {
            name: name,
            namespace: namespace
        })
    }

    get noEmit() {
        return this.props.$noEmit === true
    }
    set noEmit(value: boolean) {
        this.props.$noEmit = value
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
        if (other instanceof ResourceEntity) {
            return Object.is(this, other)
        }
        return false
    }

    protected abstract get __origin__(): OriginEntity
    get __vertex__(): ResourceVertex {
        return new ResourceVertex(this.__origin__.__vertex__, this)
    }
}
