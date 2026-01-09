import type { Gvk_Base } from "./gvk"
import type { Resource_Props } from "./props"
import { Resource } from "./resource"

export abstract class ResourcePart<Props extends Resource_Props = Resource_Props> extends Resource<
    string,
    Props
> {
    abstract get kind(): Gvk_Base
    #parent: Resource
    constructor(parent: Resource, name: string, props: Props) {
        const parentNs = parent.ident.namespace

        super(name, parentNs, props)
        this.#parent = parent
    }

    protected get __parent__(): Resource {
        return this.#parent
    }

    protected abstract __submanifest__(): object

    protected get __origin__() {
        return this.__parent__["__origin__"]
    }
}
