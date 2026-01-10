import type { Gvk_Base } from "./gvk"
import type { Resource_Props } from "./props"
import { ResourceEntity } from "./resource"

export abstract class ResourcePart<
    Props extends Resource_Props = Resource_Props
> extends ResourceEntity<string, Props> {
    abstract get kind(): Gvk_Base
    #parent: ResourceEntity
    constructor(parent: ResourceEntity, name: string, props: Props) {
        const parentNs = parent.ident.namespace

        super(name, parentNs, props)
        this.#parent = parent
    }

    protected get __parent__(): ResourceEntity {
        return this.#parent
    }

    protected abstract __submanifest__(): object

    protected get __origin__() {
        return this.__parent__["__origin__"]
    }
}
